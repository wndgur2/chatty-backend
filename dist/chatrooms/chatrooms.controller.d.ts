import type { Request } from 'express';
import { CreateChatroomDto } from './dto/create-chatroom.dto';
import { UpdateChatroomDto } from './dto/update-chatroom.dto';
import { ChatroomsService } from './chatrooms.service';
export declare class ChatroomsController {
    private readonly chatroomsService;
    constructor(chatroomsService: ChatroomsService);
    findAll(): Promise<{
        name: string;
        basePrompt: string | null;
        id: bigint;
        userId: bigint;
        profileImageUrl: string | null;
        currentDelaySeconds: number;
        nextEvaluationTime: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(createChatroomDto: CreateChatroomDto, file: Express.Multer.File, req: Request): Promise<{
        name: string;
        basePrompt: string | null;
        id: bigint;
        userId: bigint;
        profileImageUrl: string | null;
        currentDelaySeconds: number;
        nextEvaluationTime: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findOne(chatroomId: number): Promise<{
        name: string;
        basePrompt: string | null;
        id: bigint;
        userId: bigint;
        profileImageUrl: string | null;
        currentDelaySeconds: number;
        nextEvaluationTime: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(chatroomId: number, updateChatroomDto: UpdateChatroomDto, file: Express.Multer.File, req: Request): Promise<{
        name: string;
        basePrompt: string | null;
        id: bigint;
        userId: bigint;
        profileImageUrl: string | null;
        currentDelaySeconds: number;
        nextEvaluationTime: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(chatroomId: number): Promise<void>;
    clone(chatroomId: number): Promise<{
        name: string;
        basePrompt: string | null;
        id: bigint;
        userId: bigint;
        profileImageUrl: string | null;
        currentDelaySeconds: number;
        nextEvaluationTime: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    branch(chatroomId: number): Promise<{
        name: string;
        basePrompt: string | null;
        id: bigint;
        userId: bigint;
        profileImageUrl: string | null;
        currentDelaySeconds: number;
        nextEvaluationTime: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
