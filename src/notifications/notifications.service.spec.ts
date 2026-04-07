import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';

const mockNotificationsRepository = {
  findDeviceByToken: jest.fn(),
  createDevice: jest.fn(),
  updateDeviceOwner: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: NotificationsRepository,
          useValue: mockNotificationsRepository,
        },
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
    mockNotificationsRepository.findDeviceByToken.mockResolvedValue(null);
    mockNotificationsRepository.createDevice.mockResolvedValue({ id: 1n });

    const result = await service.registerDevice('1', { deviceToken: 'dummy' });
    expect(result).toEqual({
      status: 'success',
      message: 'FCM token registered successfully.',
    });
    expect(mockNotificationsRepository.createDevice).toHaveBeenCalled();
  });

  it('should update an existing device token if userId does not match', async () => {
    mockNotificationsRepository.findDeviceByToken.mockResolvedValue({
      id: 1n,
      userId: 99n,
    });
    mockNotificationsRepository.updateDeviceOwner.mockResolvedValue({
      id: 1n,
      userId: 1n,
    });

    const result = await service.registerDevice('1', { deviceToken: 'dummy' });
    expect(result).toEqual({
      status: 'success',
      message: 'FCM token registered successfully.',
    });
    expect(mockNotificationsRepository.updateDeviceOwner).toHaveBeenCalled();
  });
});
