import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join, isAbsolute } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatroomsModule } from './chatrooms/chatrooms.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { OllamaModule } from './ollama/ollama.module';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

const assetsRootPath = (() => {
  const dir = process.env.ASSETS_DIR;
  if (!dir) {
    return join(process.cwd(), 'src', 'assets');
  }
  return isAbsolute(dir) ? dir : join(process.cwd(), dir);
})();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: assetsRootPath,
      serveRoot: '/assets',
    }),
    ScheduleModule.forRoot(),
    ChatroomsModule,
    MessagesModule,
    NotificationsModule,
    PrismaModule,
    OllamaModule,
    TasksModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
