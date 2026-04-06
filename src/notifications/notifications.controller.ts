import { Controller, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RegisterDeviceDto } from './dto/register-device.dto';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('register')
  async registerDevice(@Body() registerDeviceDto: RegisterDeviceDto) {
    return this.notificationsService.registerDevice(registerDeviceDto);
  }
}
