import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatroomStateRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(chatroomId: bigint) {
    return this.prisma.chatroom.findUnique({
      where: { id: chatroomId },
    });
  }

  findByIdAndUser(chatroomId: bigint, userId: bigint) {
    return this.prisma.chatroom.findFirst({
      where: { id: chatroomId, userId },
    });
  }

  resetDelay(chatroomId: bigint) {
    return this.prisma.chatroom.update({
      where: { id: chatroomId },
      data: {
        currentDelaySeconds: 10,
        nextEvaluationTime: this.getNextEvaluationTime(10),
      },
    });
  }

  private getNextEvaluationTime(delaySeconds: number): Date {
    const nextTime = new Date();
    nextTime.setSeconds(nextTime.getSeconds() + delaySeconds);
    return nextTime;
  }
}
