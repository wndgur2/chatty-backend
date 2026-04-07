import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsRepository } from './notifications.repository';

@Module({
  imports: [PrismaModule],
  providers: [NotificationsService, NotificationsRepository],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
