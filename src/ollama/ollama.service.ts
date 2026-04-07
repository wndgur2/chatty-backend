import { Injectable, Logger } from '@nestjs/common';
import { Ollama } from 'ollama';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  public ollama: Ollama;

  private chatModel = 'hf.co/soob3123/amoral-gemma3-12B-v2-qat-Q4_0-GGUF:Q4_0';
  private evalModel = 'qwen2.5:1.5b';

  constructor() {
    this.ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
  }

  async evaluateToAnswer(
    history: ChatMessage[],
    basePrompt: string,
  ): Promise<boolean> {
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
    } catch (e) {
      this.logger.error('Failed to evaluate conversation', e);
      return false; // Default to not answering on fail.
    }
  }

  // Used for streaming WebSockets
  async streamChatResponse(history: ChatMessage[], basePrompt: string) {
    return this.ollama.chat({
      model: this.chatModel,
      messages: [{ role: 'system', content: basePrompt }, ...history],
      stream: true,
    });
  }
}
