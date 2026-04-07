import { PrismaService } from '../prisma/prisma.service';
import { OllamaService } from '../ollama/ollama.service';
import { MessagesService } from '../messages/messages.service';
export declare class TasksService {
    private prisma;
    private ollama;
    private messages;
    private readonly logger;
    private isProcessing;
    constructor(prisma: PrismaService, ollama: OllamaService, messages: MessagesService);
    handleAIBackgroundEvaluations(): Promise<void>;
}
