import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findDeviceByToken(deviceToken: string) {
    return this.prisma.userDevice.findUnique({
      where: { deviceToken },
    });
  }

  createDevice(userId: bigint, deviceToken: string) {
    return this.prisma.userDevice.create({
      data: {
        userId,
        deviceToken,
      },
    });
  }

  updateDeviceOwner(deviceToken: string, userId: bigint) {
    return this.prisma.userDevice.update({
      where: { deviceToken },
      data: { userId },
    });
  }
}
