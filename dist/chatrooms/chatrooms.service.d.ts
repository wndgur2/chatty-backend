import { PrismaService } from '../prisma/prisma.service';
import { CreateChatroomDto } from './dto/create-chatroom.dto';
import { UpdateChatroomDto } from './dto/update-chatroom.dto';
export declare class ChatroomsService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly currentUserId;
    private saveProfileImage;
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
    create(dto: CreateChatroomDto, baseUrl: string, file?: Express.Multer.File): Promise<{
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
    findOne(id: number): Promise<{
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
    update(id: number, dto: UpdateChatroomDto, baseUrl: string, file?: Express.Multer.File): Promise<{
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
    remove(id: number): Promise<void>;
    clone(id: number): Promise<{
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
    branch(id: number): Promise<{
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
