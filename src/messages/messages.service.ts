import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async findHistory(chatroomId: number, limit = 50, offset = 0) {
    const history = await this.prisma.message.findMany({
      where: { chatroomId: BigInt(chatroomId) },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return history.reverse();
  }

  async sendToAI(chatroomId: number, dto: SendMessageDto) {
    // Save user message first
    const message = await this.prisma.message.create({
      data: {
        chatroomId: BigInt(chatroomId),
        sender: 'user',
        content: dto.content,
      },
    });

    // In a real scenario, this is where we'd emit to bullmq or our background queue
    // to check the next_evaluation_time constraint or trigger the LLM call directly.
    return {
      messageId: Number(message.id),
      status: 'processing',
    };
  }
}
