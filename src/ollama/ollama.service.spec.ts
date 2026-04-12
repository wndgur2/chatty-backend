/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OllamaService } from './ollama.service';
import { Ollama } from 'ollama';
import {
  DEFAULT_CHAT_OLLAMA_OPTIONS,
  VOLUNTARY_OLLAMA_OPTIONS,
} from '../ai-evaluation.constants';

describe('OllamaService', () => {
  let service: OllamaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OllamaService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, fallback: string) => fallback),
          },
        },
      ],
    }).compile();

    service = module.get<OllamaService>(OllamaService);

    // Mock the ollama internal methods
    (service as any).ollama = {
      chat: jest.fn(),
    } as unknown as Ollama;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should evaluate context to voluntarily answer and return a boolean', async () => {
    const mockChat = (service as any).ollama.chat as jest.Mock;
    mockChat.mockResolvedValue({ message: { content: 'YES' } });

    const result = await service.evaluateToAnswer(
      [{ role: 'user', content: 'hello where is AI?' }],
      'You are an AI.',
    );

    expect(mockChat).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should return false if evaluation yields NO', async () => {
    const mockChat = (service as any).ollama.chat as jest.Mock;
    mockChat.mockResolvedValue({ message: { content: 'NO' } });

    const result = await service.evaluateToAnswer(
      [{ role: 'user', content: 'just chatting with a friend.' }],
      'You are an AI.',
    );

    expect(result).toBe(false);
  });

  it('should pass voluntary decoding options when streaming a voluntary response', async () => {
    const mockChat = (service as any).ollama.chat as jest.Mock;
    async function* emptyStream() {}
    mockChat.mockReturnValue(emptyStream());

    await service.streamChatResponse([], 'system prompt', { voluntary: true });

    expect(mockChat).toHaveBeenCalledWith({
      model: 'qwen2.5:7b',
      messages: [{ role: 'system', content: 'system prompt' }],
      stream: true,
      options: { ...VOLUNTARY_OLLAMA_OPTIONS },
    });
  });

  it('should pass default chat decoding options when voluntary is unset', async () => {
    const mockChat = (service as any).ollama.chat as jest.Mock;
    async function* emptyStream() {}
    mockChat.mockReturnValue(emptyStream());

    await service.streamChatResponse([], 'system prompt');

    expect(mockChat).toHaveBeenCalledWith({
      model: 'qwen2.5:7b',
      messages: [{ role: 'system', content: 'system prompt' }],
      stream: true,
      options: { ...DEFAULT_CHAT_OLLAMA_OPTIONS },
    });
  });
});
