import { Ollama } from 'ollama';
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export declare class OllamaService {
    private readonly logger;
    ollama: Ollama;
    private chatModel;
    private evalModel;
    constructor();
    evaluateToAnswer(history: ChatMessage[], basePrompt: string): Promise<boolean>;
    streamChatResponse(history: ChatMessage[], basePrompt: string): Promise<import("ollama").AbortableAsyncIterator<import("ollama").ChatResponse>>;
}
