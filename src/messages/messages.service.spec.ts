import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma/prisma.service';
import { OllamaService } from '../ollama/ollama.service';
import { MessagesGateway } from './messages.gateway';

const mockPrismaService = {
  message: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  chatroom: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockOllamaService = {
  streamChatResponse: jest.fn(),
};

const mockMessagesGateway = {
  emitTypingState: jest.fn(),
  streamChunkToRoom: jest.fn(),
  streamEndToRoom: jest.fn(),
};

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: OllamaService, useValue: mockOllamaService },
        { provide: MessagesGateway, useValue: mockMessagesGateway },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find message history', async () => {
    const mockResult = [{ id: 1n, content: 'Hello' }];
    mockPrismaService.message.findMany.mockResolvedValue(mockResult);

    const result = await service.findHistory(1, 10, 0);
    expect(result).toEqual(mockResult);
    expect(mockPrismaService.message.findMany).toHaveBeenCalled();
  });

  it('should send a message to AI and process background stream', async () => {
    const mockCreatedMessage = { id: 103n };
    mockPrismaService.message.create.mockResolvedValue(mockCreatedMessage);

    const dto = { content: 'Tell me a joke.' };

    // Let's spy on processBackgroundMessage by ignoring errors since it runs async
    const processMock = jest
      .spyOn(service as any, 'processBackgroundMessage')
      .mockResolvedValue(undefined);

    const result = await service.sendToAI(1, dto);

    expect(result).toEqual({ messageId: 103, status: 'processing' });
    expect(mockPrismaService.message.create).toHaveBeenCalled();
    expect(processMock).toHaveBeenCalledWith(1);

    processMock.mockRestore();
  });
});
