import { Injectable } from '@nestjs/common';
import { ChatMessage, OllamaService } from '../ollama/ollama.service';

@Injectable()
export class AiResponseService {
  constructor(private readonly ollamaService: OllamaService) {}

  async generate(
    history: ChatMessage[],
    basePrompt: string,
    onChunk?: (chunk: string) => void,
  ) {
    const stream = await this.ollamaService.streamChatResponse(
      history,
      basePrompt,
    );
    let fullContent = '';

    for await (const chunk of stream) {
      const text = chunk.message?.content || '';
      if (text) {
        fullContent += text;
        onChunk?.(text);
      }
    }

    return fullContent;
  }
}
