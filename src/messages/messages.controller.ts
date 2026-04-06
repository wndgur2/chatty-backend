import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('api/chatrooms/:chatroomId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async findHistory(
    @Param('chatroomId', ParseIntPipe) chatroomId: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    // If the query params are defined, convert to numbers, but here we can just pass them.
    // It's usually better to use ParseIntPipe with validation.
    return this.messagesService.findHistory(
      chatroomId,
      limit !== undefined ? parseInt(limit.toString(), 10) : undefined,
      offset !== undefined ? parseInt(offset.toString(), 10) : undefined,
    );
  }

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async sendToAI(
    @Param('chatroomId', ParseIntPipe) chatroomId: number,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.messagesService.sendToAI(chatroomId, sendMessageDto);
  }
}
