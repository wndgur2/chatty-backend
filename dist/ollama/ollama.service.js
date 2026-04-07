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
var OllamaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaService = void 0;
const common_1 = require("@nestjs/common");
const ollama_1 = require("ollama");
let OllamaService = OllamaService_1 = class OllamaService {
    logger = new common_1.Logger(OllamaService_1.name);
    ollama;
    chatModel = 'hf.co/soob3123/amoral-gemma3-12B-v2-qat-Q4_0-GGUF:Q4_0';
    evalModel = 'qwen2.5:1.5b';
    constructor() {
        this.ollama = new ollama_1.Ollama({ host: 'http://127.0.0.1:11434' });
    }
    async evaluateToAnswer(history, basePrompt) {
        try {
            const formattedHistory = history
                .slice(-3)
                .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
                .join('\n');
            const evaluationUserPrompt = `
      ${basePrompt}\n
      Based on the conversation history below, should the assistant send additional message?
      Reply ONLY with "YES" or "NO". Do not provide any other explanation.
      
      History:
      ${formattedHistory}
      `;
            const response = await this.ollama.chat({
                model: this.evalModel,
                messages: [{ role: 'user', content: evaluationUserPrompt.trim() }],
                stream: false,
            });
            const content = response.message?.content?.trim().toUpperCase() || 'NO';
            return content.includes('YES');
        }
        catch (e) {
            this.logger.error('Failed to evaluate conversation', e);
            return false;
        }
    }
    async streamChatResponse(history, basePrompt) {
        return this.ollama.chat({
            model: this.chatModel,
            messages: [{ role: 'system', content: basePrompt }, ...history],
            stream: true,
        });
    }
};
exports.OllamaService = OllamaService;
exports.OllamaService = OllamaService = OllamaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], OllamaService);
//# sourceMappingURL=ollama.service.js.map