import { Test, TestingModule } from '@nestjs/testing';
import { ChatroomsService } from './chatrooms.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  chatroom: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  message: {
    findMany: jest.fn(),
    createMany: jest.fn(),
  },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await, @typescript-eslint/no-unsafe-call
  $transaction: jest.fn(async (cb: any) => cb(mockPrismaService)),
};

describe('ChatroomsService', () => {
  let service: ChatroomsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatroomsService,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ChatroomsService>(ChatroomsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all chatrooms', async () => {
    const mockResult = [{ id: 1n, name: 'Chat' }];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (mockPrismaService.chatroom.findMany as jest.Mock).mockResolvedValue(
      mockResult,
    );

    const result = await service.findAll();
    expect(result).toEqual(mockResult);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(mockPrismaService.chatroom.findMany).toHaveBeenCalled();
  });
});
