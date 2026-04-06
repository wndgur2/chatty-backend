import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    findHistory(chatroomId: number, limit?: number, offset?: number): Promise<{
        id: bigint;
        createdAt: Date;
        chatroomId: bigint;
        sender: import(".prisma/client").$Enums.Sender;
        content: string;
    }[]>;
    sendToAI(chatroomId: number, sendMessageDto: SendMessageDto): Promise<{
        messageId: number;
        status: string;
    }>;
}
