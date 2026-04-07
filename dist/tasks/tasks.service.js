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
var TasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const ollama_service_1 = require("../ollama/ollama.service");
const messages_service_1 = require("../messages/messages.service");
let TasksService = TasksService_1 = class TasksService {
    prisma;
    ollama;
    messages;
    logger = new common_1.Logger(TasksService_1.name);
    isProcessing = false;
    constructor(prisma, ollama, messages) {
        this.prisma = prisma;
        this.ollama = ollama;
        this.messages = messages;
    }
    async handleAIBackgroundEvaluations() {
        if (this.isProcessing)
            return;
        this.isProcessing = true;
        try {
            const now = new Date();
            const rooms = await this.prisma.chatroom.findMany({
                where: {
                    nextEvaluationTime: {
                        lte: now,
                    },
                },
            });
            if (rooms.length === 0) {
                this.isProcessing = false;
                return;
            }
            this.logger.debug(`Found ${rooms.length} rooms eligible for AI evaluation.`);
            for (const room of rooms) {
                await this.prisma.chatroom.update({
                    where: { id: room.id },
                    data: { nextEvaluationTime: null },
                });
                const historyRaw = await this.prisma.message.findMany({
                    where: { chatroomId: room.id },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                });
                if (historyRaw.length === 0) {
                    continue;
                }
                historyRaw.reverse();
                const history = historyRaw.map((msg) => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.content,
                }));
                const basePrompt = room.basePrompt || 'You are a helpful assistant.';
                try {
                    const shouldAnswer = await this.ollama.evaluateToAnswer(history, basePrompt);
                    if (shouldAnswer) {
                        this.logger.log(`Room ${room.id} evaluating to YES. Triggering AI message.`);
                        this.messages
                            .processBackgroundMessage(Number(room.id), true)
                            .catch((e) => {
                            this.logger.error(`Failed executing background message for room ${room.id}`, e);
                        });
                    }
                    else {
                        const currentDelay = room.currentDelaySeconds || 10;
                        const nextDelay = currentDelay * 2;
                        const nextEvalTime = new Date();
                        nextEvalTime.setSeconds(nextEvalTime.getSeconds() + nextDelay);
                        this.logger.log(`Room ${room.id} evaluating to NO. Backing off to ${nextDelay}s delay.`);
                        await this.prisma.chatroom.update({
                            where: { id: room.id },
                            data: {
                                currentDelaySeconds: nextDelay,
                                nextEvaluationTime: nextEvalTime,
                            },
                        });
                    }
                }
                catch (evalErr) {
                    this.logger.error(`Ollama evaluation failed for room ${room.id}`, evalErr);
                    const currentDelay = room.currentDelaySeconds || 10;
                    const nextEvalTime = new Date();
                    nextEvalTime.setSeconds(nextEvalTime.getSeconds() + currentDelay);
                    await this.prisma.chatroom.update({
                        where: { id: room.id },
                        data: {
                            nextEvaluationTime: nextEvalTime,
                        },
                    });
                }
            }
        }
        catch (error) {
            this.logger.error('Error ticking AI evaluation cron job', error);
        }
        finally {
            this.isProcessing = false;
        }
    }
};
exports.TasksService = TasksService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_10_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TasksService.prototype, "handleAIBackgroundEvaluations", null);
exports.TasksService = TasksService = TasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ollama_service_1.OllamaService,
        messages_service_1.MessagesService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map