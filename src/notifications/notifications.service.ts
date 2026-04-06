import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDeviceDto } from './dto/register-device.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  private readonly currentUserId = BigInt(1);

  async registerDevice(dto: RegisterDeviceDto) {
    const existing = await this.prisma.userDevice.findUnique({
      where: { deviceToken: dto.deviceToken },
    });

    if (!existing) {
      await this.prisma.userDevice.create({
        data: {
          userId: this.currentUserId,
          deviceToken: dto.deviceToken,
        },
      });
    } else if (existing.userId !== this.currentUserId) {
      await this.prisma.userDevice.update({
        where: { deviceToken: dto.deviceToken },
        data: { userId: this.currentUserId },
      });
    }

    return {
      status: 'success',
      message: 'FCM token registered successfully.',
    };
  }
}
