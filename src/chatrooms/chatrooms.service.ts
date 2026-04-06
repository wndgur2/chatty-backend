import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatroomDto } from './dto/create-chatroom.dto';
import { UpdateChatroomDto } from './dto/update-chatroom.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ChatroomsService {
  constructor(private prisma: PrismaService) {}

  private readonly currentUserId = BigInt(1);

  private async saveProfileImage(
    file: Express.Multer.File,
    baseUrl: string,
  ): Promise<string> {
    const assetsDir = path.join(process.cwd(), 'src', 'assets');
    if (!fs.existsSync(assetsDir)) {
      await fs.promises.mkdir(assetsDir, { recursive: true });
    }
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(assetsDir, fileName);
    await fs.promises.writeFile(filePath, file.buffer);
    return `${baseUrl}/assets/${fileName}`;
  }

  async findAll() {
    return this.prisma.chatroom.findMany({
      where: { userId: this.currentUserId },
    });
  }

  async create(
    dto: CreateChatroomDto,
    baseUrl: string,
    file?: Express.Multer.File,
  ) {
    let profileImageUrl: string | null = null;
    if (file) {
      profileImageUrl = await this.saveProfileImage(file, baseUrl);
    }

    return this.prisma.chatroom.create({
      data: {
        userId: this.currentUserId,
        name: dto.name,
        basePrompt: dto.basePrompt,
        profileImageUrl,
      },
    });
  }

  async findOne(id: number) {
    const chatroom = await this.prisma.chatroom.findFirst({
      where: { id: BigInt(id), userId: this.currentUserId },
    });
    if (!chatroom) throw new NotFoundException('Chatroom not found');
    return chatroom;
  }

  async update(
    id: number,
    dto: UpdateChatroomDto,
    baseUrl: string,
    file?: Express.Multer.File,
  ) {
    const chatroom = await this.findOne(id);

    let profileImageUrl = chatroom.profileImageUrl;
    if (file) {
      profileImageUrl = await this.saveProfileImage(file, baseUrl);
    }

    return this.prisma.chatroom.update({
      where: { id: chatroom.id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.basePrompt && { basePrompt: dto.basePrompt }),
        profileImageUrl,
      },
    });
  }

  async remove(id: number) {
    const chatroom = await this.findOne(id);
    await this.prisma.chatroom.delete({ where: { id: chatroom.id } });
  }

  async clone(id: number) {
    const source = await this.findOne(id);
    return this.prisma.chatroom.create({
      data: {
        userId: source.userId,
        name: `${source.name} (Clone)`,
        basePrompt: source.basePrompt,
        profileImageUrl: source.profileImageUrl,
      },
    });
  }

  async branch(id: number) {
    const source = await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      const newChatroom = await tx.chatroom.create({
        data: {
          userId: source.userId,
          name: `${source.name} (Branch)`,
          basePrompt: source.basePrompt,
          profileImageUrl: source.profileImageUrl,
        },
      });

      const messages = await tx.message.findMany({
        where: { chatroomId: source.id },
      });

      if (messages.length > 0) {
        await tx.message.createMany({
          data: messages.map((m) => ({
            chatroomId: newChatroom.id,
            sender: m.sender,
            content: m.content,
            createdAt: m.createdAt,
          })),
        });
      }

      return newChatroom;
    });
  }
}
