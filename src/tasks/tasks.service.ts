import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { INITIAL_AI_EVALUATION_DELAY_SECONDS } from '../ai-evaluation.constants';
import { PrismaService } from '../prisma/prisma.service';
import { OllamaService } from '../ollama/ollama.service';
import { MessagesService } from '../messages/messages.service';
import { toChatHistory } from '../messages/chat-history.util';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private isProcessing = false;

  constructor(
    private prisma: PrismaService,
    private ollama: OllamaService,
    private messages: MessagesService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleAIBackgroundEvaluations() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = new Date();

      // Find chatrooms that are eligible for evaluation
      const rooms = await this.prisma.chatroom.findMany({
        where: {
          nextEvaluationTime: {
            lte: now,
          },
        },
      });

      if (rooms.length === 0) {
        this.isProcessing = false;
        return;
      }

      this.logger.debug(
        `Found ${rooms.length} rooms eligible for AI evaluation.`,
      );

      for (const room of rooms) {
        // Lock room so it's not picked up by next cron tick
        await this.prisma.chatroom.update({
          where: { id: room.id },
          data: { nextEvaluationTime: null },
        });

        const historyRaw = await this.prisma.message.findMany({
          where: { chatroomId: room.id },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });

        // Ensure there is at least one user message in the room
        if (historyRaw.length === 0) {
          continue;
        }

        const history = toChatHistory(historyRaw);

        const basePrompt = room.basePrompt || 'You are a helpful assistant.';

        try {
          const shouldAnswer = await this.ollama.evaluateToAnswer(
            history,
            basePrompt,
          );

          if (shouldAnswer) {
            this.logger.log(
              `Room ${room.id} evaluating to YES. Triggering AI message.`,
            );
            // Kick off standard background generator
            this.messages
              .processBackgroundMessage(Number(room.id), true)
              .catch((e) => {
                this.logger.error(
                  `Failed executing background message for room ${room.id}`,
                  e,
                );
              });
          } else {
            // double the delay
            const currentDelay =
              room.currentDelaySeconds || INITIAL_AI_EVALUATION_DELAY_SECONDS;
            const nextDelay = currentDelay * 2;
            const nextEvalTime = new Date();
            nextEvalTime.setSeconds(nextEvalTime.getSeconds() + nextDelay);

            this.logger.log(
              `Room ${room.id} evaluating to NO. Backing off to ${nextDelay}s delay.`,
            );

            await this.prisma.chatroom.update({
              where: { id: room.id },
              data: {
                currentDelaySeconds: nextDelay,
                nextEvaluationTime: nextEvalTime,
              },
            });
          }
        } catch (evalErr) {
          this.logger.error(
            `Ollama evaluation failed for room ${room.id}`,
            evalErr,
          );
          // On failure, revert to same delay and schedule it retry
          const currentDelay =
            room.currentDelaySeconds || INITIAL_AI_EVALUATION_DELAY_SECONDS;
          const nextEvalTime = new Date();
          nextEvalTime.setSeconds(nextEvalTime.getSeconds() + currentDelay);

          await this.prisma.chatroom.update({
            where: { id: room.id },
            data: {
              nextEvaluationTime: nextEvalTime,
            },
          });
        }
      }
    } catch (error) {
      this.logger.error('Error ticking AI evaluation cron job', error);
    } finally {
      this.isProcessing = false;
    }
  }
}
