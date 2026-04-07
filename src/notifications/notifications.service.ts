import { Injectable } from '@nestjs/common';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async registerDevice(userId: string, dto: RegisterDeviceDto) {
    const currentUserId = BigInt(userId);
    const existing = await this.notificationsRepository.findDeviceByToken(
      dto.deviceToken,
    );

    if (!existing) {
      await this.notificationsRepository.createDevice(
        currentUserId,
        dto.deviceToken,
      );
    } else if (existing.userId !== currentUserId) {
      await this.notificationsRepository.updateDeviceOwner(
        dto.deviceToken,
        currentUserId,
      );
    }

    return {
      status: 'success',
      message: 'FCM token registered successfully.',
    };
  }
}
