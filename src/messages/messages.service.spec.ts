import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { MessageHistoryService } from './message-history.service';
import { MessageSendService } from './message-send.service';
import { MessageStreamService } from './message-stream.service';
import { AiResponseService } from './ai-response.service';
import { MessagesRepository } from './messages.repository';
import { ChatroomStateRepository } from './chatroom-state.repository';

const mockMessageHistoryService = { findHistory: jest.fn() };
const mockMessageSendService = { saveUserMessage: jest.fn() };
const mockMessageStreamService = {
  setTyping: jest.fn(),
  streamChunk: jest.fn(),
  streamComplete: jest.fn(),
};
const mockAiResponseService = { generate: jest.fn() };
const mockMessagesRepository = {
  createMessage: jest.fn(),
  findRecent: jest.fn(),
};
const mockChatroomStateRepository = {
  resetDelay: jest.fn(),
  findByIdAndUser: jest.fn(),
  findById: jest.fn(),
};

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: MessageHistoryService, useValue: mockMessageHistoryService },
        { provide: MessageSendService, useValue: mockMessageSendService },
        { provide: MessageStreamService, useValue: mockMessageStreamService },
        { provide: AiResponseService, useValue: mockAiResponseService },
        { provide: MessagesRepository, useValue: mockMessagesRepository },
        {
          provide: ChatroomStateRepository,
          useValue: mockChatroomStateRepository,
        },
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
    mockMessageHistoryService.findHistory.mockResolvedValue(mockResult);
    mockChatroomStateRepository.findByIdAndUser.mockResolvedValue({ id: 1n });

    const result = await service.findHistory('1', 1, 10, 0);
    expect(result).toEqual(mockResult);
    expect(mockMessageHistoryService.findHistory).toHaveBeenCalledWith(
      1,
      10,
      0,
    );
  });

  it('should send a message to AI and process background stream', async () => {
    const mockCreatedMessage = { id: '103' };
    mockMessageSendService.saveUserMessage.mockResolvedValue(
      mockCreatedMessage,
    );
    mockChatroomStateRepository.findByIdAndUser.mockResolvedValue({ id: 1n });

    const dto = { content: 'Tell me a joke.' };

    // Let's spy on processBackgroundMessage by ignoring errors since it runs async
    const processMock = jest
      .spyOn(service as any, 'processBackgroundMessage')
      .mockResolvedValue(undefined);

    const result = await service.sendToAI('1', 1, dto);

    expect(result).toEqual({ messageId: '103', status: 'processing' });
    expect(mockMessageSendService.saveUserMessage).toHaveBeenCalled();
    expect(processMock).toHaveBeenCalledWith(1);

    processMock.mockRestore();
  });
});
