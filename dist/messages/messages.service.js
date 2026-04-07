"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MessagesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ollama_service_1 = require("../ollama/ollama.service");
const messages_gateway_1 = require("./messages.gateway");
let MessagesService = MessagesService_1 = class MessagesService {
    prisma;
    ollamaService;
    messagesGateway;
    logger = new common_1.Logger(MessagesService_1.name);
    constructor(prisma, ollamaService, messagesGateway) {
        this.prisma = prisma;
        this.ollamaService = ollamaService;
        this.messagesGateway = messagesGateway;
    }
    async findHistory(chatroomId, limit = 50, offset = 0) {
        const history = await this.prisma.message.findMany({
            where: { chatroomId: BigInt(chatroomId) },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });
        return history.reverse();
    }
    getNextEvaluationTime(delaySeconds) {
        const nextTime = new Date();
        nextTime.setSeconds(nextTime.getSeconds() + delaySeconds);
        return nextTime;
    }
    async sendToAI(chatroomId, dto) {
        const chatRoomIdBigInt = BigInt(chatroomId);
        const message = await this.prisma.message.create({
            data: {
                chatroomId: chatRoomIdBigInt,
                sender: 'user',
                content: dto.content,
            },
        });
        await this.prisma.chatroom.update({
            where: { id: chatRoomIdBigInt },
            data: {
                currentDelaySeconds: 10,
                nextEvaluationTime: this.getNextEvaluationTime(10),
            },
        });
        this.processBackgroundMessage(chatroomId).catch((err) => {
            this.logger.error('Background processing failed', err);
        });
        return {
            messageId: Number(message.id),
            status: 'processing',
        };
    }
    async processBackgroundMessage(chatroomId, valuntary = false) {
        try {
            const chatRoomIdBigInt = BigInt(chatroomId);
            const room = await this.prisma.chatroom.findUnique({
                where: { id: chatRoomIdBigInt },
            });
            if (!room)
                return;
            const basePrompt = room.basePrompt || '';
            console.log('Base prompt for AI:', basePrompt);
            const historyRaw = await this.prisma.message.findMany({
                where: { chatroomId: chatRoomIdBigInt },
                orderBy: { createdAt: 'desc' },
                take: valuntary ? 3 : 10,
            });
            historyRaw.reverse();
            const history = historyRaw.map((msg) => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.content,
            }));
            if (valuntary) {
                history.push({
                    role: 'system',
                    content: 'You should respond with additional message.',
                });
            }
            this.messagesGateway.emitTypingState(chatroomId, true);
            const stream = await this.ollamaService.streamChatResponse(history, basePrompt);
            let fullContent = '';
            for await (const chunk of stream) {
                const text = chunk.message?.content || '';
                if (text) {
                    fullContent += text;
                    this.messagesGateway.streamChunkToRoom(chatroomId, text);
                }
            }
            this.messagesGateway.emitTypingState(chatroomId, false);
            const aiDBMessage = await this.prisma.message.create({
                data: {
                    chatroomId: chatRoomIdBigInt,
                    sender: 'ai',
                    content: fullContent,
                },
            });
            await this.prisma.chatroom.update({
                where: { id: chatRoomIdBigInt },
                data: {
                    currentDelaySeconds: 10,
                    nextEvaluationTime: this.getNextEvaluationTime(10),
                },
            });
            this.messagesGateway.streamEndToRoom(chatroomId, fullContent, Number(aiDBMessage.id));
        }
        catch (e) {
            this.logger.error(`Error processing AI message for room ${chatroomId}`, e);
            this.messagesGateway.emitTypingState(chatroomId, false);
        }
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = MessagesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ollama_service_1.OllamaService,
        messages_gateway_1.MessagesGateway])
], MessagesService);
//# sourceMappingURL=messages.service.js.map