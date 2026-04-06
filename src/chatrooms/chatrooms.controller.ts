import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateChatroomDto } from './dto/create-chatroom.dto';
import { UpdateChatroomDto } from './dto/update-chatroom.dto';
import { ChatroomsService } from './chatrooms.service';

@Controller('api/chatrooms')
export class ChatroomsController {
  constructor(private readonly chatroomsService: ChatroomsService) {}

  @Get()
  async findAll() {
    return this.chatroomsService.findAll();
  }

  @Post()
  @UseInterceptors(FileInterceptor('profileImage'))
  async create(
    @Body() createChatroomDto: CreateChatroomDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.chatroomsService.create(createChatroomDto, baseUrl, file);
  }

  @Get(':chatroomId')
  async findOne(@Param('chatroomId', ParseIntPipe) chatroomId: number) {
    return this.chatroomsService.findOne(chatroomId);
  }

  @Patch(':chatroomId')
  @UseInterceptors(FileInterceptor('profileImage'))
  async update(
    @Param('chatroomId', ParseIntPipe) chatroomId: number,
    @Body() updateChatroomDto: UpdateChatroomDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.chatroomsService.update(
      chatroomId,
      updateChatroomDto,
      baseUrl,
      file,
    );
  }

  @Delete(':chatroomId')
  async remove(@Param('chatroomId', ParseIntPipe) chatroomId: number) {
    return this.chatroomsService.remove(chatroomId);
  }

  @Post(':chatroomId/clone')
  async clone(@Param('chatroomId', ParseIntPipe) chatroomId: number) {
    return this.chatroomsService.clone(chatroomId);
  }

  @Post(':chatroomId/branch')
  async branch(@Param('chatroomId', ParseIntPipe) chatroomId: number) {
    return this.chatroomsService.branch(chatroomId);
  }
}
