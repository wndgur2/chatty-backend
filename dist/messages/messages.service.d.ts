import { PrismaService } from '../prisma/prisma.service';
import { OllamaService } from '../ollama/ollama.service';
import { MessagesGateway } from './messages.gateway';
import { SendMessageDto } from './dto/send-message.dto';
export declare class MessagesService {
    private prisma;
    private ollamaService;
    private messagesGateway;
    private readonly logger;
    constructor(prisma: PrismaService, ollamaService: OllamaService, messagesGateway: MessagesGateway);
    findHistory(chatroomId: number, limit?: number, offset?: number): Promise<{
        id: bigint;
        chatroomId: bigint;
        sender: import(".prisma/client").$Enums.Sender;
        content: string;
        createdAt: Date;
    }[]>;
    private getNextEvaluationTime;
    sendToAI(chatroomId: number, dto: SendMessageDto): Promise<{
        messageId: number;
        status: string;
    }>;
    processBackgroundMessage(chatroomId: number, valuntary?: boolean): Promise<void>;
}
