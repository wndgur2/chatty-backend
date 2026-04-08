import { ChatMessage } from '../ollama/ollama.service';

type MessageLike = {
  sender: 'user' | 'ai';
  content: string;
};

export function toChatHistory(messages: MessageLike[]): ChatMessage[] {
  return [...messages].reverse().map((message) => ({
    role: message.sender === 'user' ? 'user' : 'assistant',
    content: message.content,
  }));
}
