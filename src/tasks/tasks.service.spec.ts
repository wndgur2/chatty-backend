import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { OllamaService } from '../ollama/ollama.service';
import { MessagesService } from '../messages/messages.service';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: {
            chatroom: {
              findMany: jest.fn().mockResolvedValue([]),
              update: jest.fn(),
            },
            message: {
              findMany: jest.fn().mockResolvedValue([]),
            },
          },
        },
        {
          provide: OllamaService,
          useValue: {
            evaluateToAnswer: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: MessagesService,
          useValue: {
            processBackgroundMessage: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
