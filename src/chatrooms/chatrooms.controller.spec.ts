import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { ChatroomsController } from './chatrooms.controller';
import { ChatroomsService } from './chatrooms.service';
import { Readable } from 'stream';

const mockChatroomsService = {
  findAll: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  clone: jest.fn(),
  branch: jest.fn(),
};

describe('ChatroomsController', () => {
  let controller: ChatroomsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatroomsController],
      providers: [
        {
          provide: ChatroomsService,
          useValue: mockChatroomsService,
        },
      ],
    }).compile();

    controller = module.get<ChatroomsController>(ChatroomsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an array of chatrooms', async () => {
    const result = [{ id: 1, name: 'General Chat' }];
    mockChatroomsService.findAll.mockResolvedValue(result);

    expect(await controller.findAll()).toBe(result);
    expect(mockChatroomsService.findAll).toHaveBeenCalled();
  });

  it('should create a chatroom', async () => {
    const dto = { name: 'New Chat', basePrompt: 'Prompt' };

    const file: Express.Multer.File = {
      buffer: Buffer.from(''),
      fieldname: 'profileImage',
      originalname: 'test.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: 0,
      stream: new Readable(),
      destination: '',
      filename: '',
      path: '',
    };
    const result = { id: 2, ...dto };
    mockChatroomsService.create.mockResolvedValue(result);

    const mockRequest = {
      protocol: 'http',
      get: () => 'localhost:3000',
    } as unknown as Request;

    expect(await controller.create(dto, file, mockRequest)).toBe(result);
  });

  it('should return a single chatroom by id', async () => {
    const result = { id: 1, name: 'General Chat' };
    mockChatroomsService.findOne.mockResolvedValue(result);

    expect(await controller.findOne(1)).toBe(result);
    expect(mockChatroomsService.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a chatroom', async () => {
    const dto = { basePrompt: 'New Prompt' };

    const file: Express.Multer.File = {
      buffer: Buffer.from(''),
      fieldname: 'profileImage',
      originalname: 'test.png',
      encoding: '7bit',
      mimetype: 'image/png',
      size: 0,
      stream: new Readable(),
      destination: '',
      filename: '',
      path: '',
    };
    const result = { id: 1, ...dto };
    mockChatroomsService.update.mockResolvedValue(result);

    const mockRequest = {
      protocol: 'http',
      get: () => 'localhost:3000',
    } as unknown as Request;

    expect(await controller.update(1, dto, file, mockRequest)).toBe(result);
  });

  it('should delete a chatroom', async () => {
    mockChatroomsService.remove.mockResolvedValue(undefined);

    await controller.remove(1);
    expect(mockChatroomsService.remove).toHaveBeenCalledWith(1);
  });

  it('should clone a chatroom', async () => {
    const result = { id: 3, name: 'Clone' };
    mockChatroomsService.clone.mockResolvedValue(result);

    expect(await controller.clone(1)).toBe(result);
    expect(mockChatroomsService.clone).toHaveBeenCalledWith(1);
  });

  it('should branch a chatroom', async () => {
    const result = { id: 4, name: 'Branch' };
    mockChatroomsService.branch.mockResolvedValue(result);

    expect(await controller.branch(1)).toBe(result);
    expect(mockChatroomsService.branch).toHaveBeenCalledWith(1);
  });
});
