import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OllamaService, ChatMessage } from '../ollama/ollama.service';
import { MessagesGateway } from './messages.gateway';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private prisma: PrismaService,
    private ollamaService: OllamaService,
    private messagesGateway: MessagesGateway,
  ) {}

  async findHistory(chatroomId: number, limit = 50, offset = 0) {
    const history = await this.prisma.message.findMany({
      where: { chatroomId: BigInt(chatroomId) },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return history.reverse();
  }

  private getNextEvaluationTime(delaySeconds: number): Date {
    const nextTime = new Date();
    nextTime.setSeconds(nextTime.getSeconds() + delaySeconds);
    return nextTime;
  }

  async sendToAI(chatroomId: number, dto: SendMessageDto) {
    const chatRoomIdBigInt = BigInt(chatroomId);

    // Save user message first and reset slow-start delay
    const message = await this.prisma.message.create({
      data: {
        chatroomId: chatRoomIdBigInt,
        sender: 'user',
        content: dto.content,
      },
    });

    await this.prisma.chatroom.update({
      where: { id: chatRoomIdBigInt },
      data: {
        currentDelaySeconds: 10,
        nextEvaluationTime: this.getNextEvaluationTime(10),
      },
    });

    // Fire and forget the background generator logic
    this.processBackgroundMessage(chatroomId).catch((err) => {
      this.logger.error('Background processing failed', err);
    });

    return {
      messageId: Number(message.id),
      status: 'processing',
    };
  }

  public async processBackgroundMessage(chatroomId: number, valuntary = false) {
    try {
      const chatRoomIdBigInt = BigInt(chatroomId);
      const room = await this.prisma.chatroom.findUnique({
        where: { id: chatRoomIdBigInt },
      });

      if (!room) return;

      const basePrompt = room.basePrompt || '';

      console.log('Base prompt for AI:', basePrompt); // Debug log for base prompt

      // Fetch last 10 messages for context
      const historyRaw = await this.prisma.message.findMany({
        where: { chatroomId: chatRoomIdBigInt },
        orderBy: { createdAt: 'desc' },
        take: valuntary ? 3 : 10,
      });

      // Reverse so it's chronologically forward
      historyRaw.reverse();

      const history: ChatMessage[] = historyRaw.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      if (valuntary) {
        history.push({
          role: 'system',
          content: 'You should respond with additional message.',
        });
      }

      this.messagesGateway.emitTypingState(chatroomId, true);

      const stream = await this.ollamaService.streamChatResponse(
        history,
        basePrompt,
      );

      let fullContent = '';

      for await (const chunk of stream) {
        const text = chunk.message?.content || '';
        if (text) {
          fullContent += text;
          this.messagesGateway.streamChunkToRoom(chatroomId, text);
        }
      }

      this.messagesGateway.emitTypingState(chatroomId, false);

      // Save completed AI message into DB and optionally reset delay
      const aiDBMessage = await this.prisma.message.create({
        data: {
          chatroomId: chatRoomIdBigInt,
          sender: 'ai',
          content: fullContent,
        },
      });

      // Update room delay again since AI just spoke, so next voluntary message is minimum 10s away.
      await this.prisma.chatroom.update({
        where: { id: chatRoomIdBigInt },
        data: {
          currentDelaySeconds: 10,
          nextEvaluationTime: this.getNextEvaluationTime(10),
        },
      });

      this.messagesGateway.streamEndToRoom(
        chatroomId,
        fullContent,
        Number(aiDBMessage.id),
      );
    } catch (e) {
      this.logger.error(
        `Error processing AI message for room ${chatroomId}`,
        e,
      );
      this.messagesGateway.emitTypingState(chatroomId, false);
      // Optional: Inform room about failure
    }
  }
}
