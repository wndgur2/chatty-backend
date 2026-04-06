import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
export declare class MessagesService {
    private prisma;
    constructor(prisma: PrismaService);
    findHistory(chatroomId: number, limit?: number, offset?: number): Promise<{
        id: bigint;
        createdAt: Date;
        chatroomId: bigint;
        sender: import(".prisma/client").$Enums.Sender;
        content: string;
    }[]>;
    sendToAI(chatroomId: number, dto: SendMessageDto): Promise<{
        messageId: number;
        status: string;
    }>;
}
