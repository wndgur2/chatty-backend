import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  userDevice: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a new device token', async () => {
    mockPrismaService.userDevice.findUnique.mockResolvedValue(null);
    mockPrismaService.userDevice.create.mockResolvedValue({ id: 1n });

    const result = await service.registerDevice({ deviceToken: 'dummy' });
    expect(result).toEqual({
      status: 'success',
      message: 'FCM token registered successfully.',
    });
    expect(mockPrismaService.userDevice.create).toHaveBeenCalled();
  });

  it('should update an existing device token if userId does not match', async () => {
    mockPrismaService.userDevice.findUnique.mockResolvedValue({
      id: 1n,
      userId: 99n,
    });
    mockPrismaService.userDevice.update.mockResolvedValue({
      id: 1n,
      userId: 1n,
    });

    const result = await service.registerDevice({ deviceToken: 'dummy' });
    expect(result).toEqual({
      status: 'success',
      message: 'FCM token registered successfully.',
    });
    expect(mockPrismaService.userDevice.update).toHaveBeenCalled();
  });
});
