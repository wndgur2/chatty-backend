import { Controller, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user.type';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('register')
  async registerDevice(
    @CurrentUser() user: AuthUser,
    @Body() registerDeviceDto: RegisterDeviceDto,
  ) {
    return this.notificationsService.registerDevice(
      user.userId,
      registerDeviceDto,
    );
  }
}
