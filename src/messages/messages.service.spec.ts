import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  message: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
};

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: PrismaService, useValue: mockPrismaService },
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

  it('should send a message to AI', async () => {
    const mockResult = { id: 103n };
    mockPrismaService.message.create.mockResolvedValue(mockResult);

    const dto = { content: 'Tell me a joke.' };
    const result = await service.sendToAI(1, dto);

    expect(result).toEqual({ messageId: 103, status: 'processing' });
    expect(mockPrismaService.message.create).toHaveBeenCalled();
  });
});
