import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Ollama } from 'ollama';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  public ollama: Ollama;

  private readonly chatModel: string;
  private readonly evalModel: string;

  constructor(private readonly configService: ConfigService) {
    this.chatModel = this.configService.get<string>(
      'OLLAMA_CHAT_MODEL',
      'qwen2.5:7b',
    );
    this.evalModel = this.configService.get<string>(
      'OLLAMA_EVAL_MODEL',
      'qwen2.5:1.5b',
    );
    this.ollama = new Ollama({
      host: this.configService.get<string>(
        'OLLAMA_HOST',
        'http://127.0.0.1:11434',
      ),
    });
  }

  async evaluateToAnswer(
    history: ChatMessage[],
    basePrompt: string,
  ): Promise<boolean> {
    try {
      const formattedHistory = history
        .slice(-10)
        .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n');

      const evaluationUserPrompt = `
      ${basePrompt}\n
      Based on the conversation history below, should the assistant send additional message?
      Reply ONLY with "YES" or "NO". Do not provide any other explanation.

      REPLY with "YES" if user requested reminder, alert, or notification.
      
      History:
      ${formattedHistory}
      `;

      const response = await this.ollama.chat({
        model: this.evalModel,
        messages: [{ role: 'system', content: evaluationUserPrompt.trim() }],
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
