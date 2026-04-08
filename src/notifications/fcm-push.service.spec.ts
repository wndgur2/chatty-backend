import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FcmPushService } from './fcm-push.service';
import { NotificationsRepository } from './notifications.repository';

const sendEachForMulticast = jest.fn();

jest.mock('firebase-admin', () => {
  const apps: unknown[] = [];
  return {
    apps,
    initializeApp: jest.fn(() => {
      apps.push({});
    }),
    credential: {
      cert: jest.fn(() => ({})),
      applicationDefault: jest.fn(() => ({})),
    },
    messaging: jest.fn(() => ({
      sendEachForMulticast,
    })),
  };
});

describe('FcmPushService', () => {
  let service: FcmPushService;
  let repository: jest.Mocked<
    Pick<
      NotificationsRepository,
      'findDeviceTokensByUserId' | 'deleteByDeviceTokens'
    >
  >;

  beforeEach(async () => {
    sendEachForMulticast.mockReset();

    repository = {
      findDeviceTokensByUserId: jest.fn(),
      deleteByDeviceTokens: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FcmPushService,
        { provide: NotificationsRepository, useValue: repository },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'FIREBASE_SERVICE_ACCOUNT_JSON') {
                return JSON.stringify({
                  projectId: 'test',
                  clientEmail: 'x@test.iam.gserviceaccount.com',
                  privateKey:
                    '-----BEGIN PRIVATE KEY-----\nMIIE\n-----END PRIVATE KEY-----\n',
                });
              }
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<FcmPushService>(FcmPushService);
    service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send multicast and delete invalid tokens', async () => {
    repository.findDeviceTokensByUserId.mockResolvedValue([
      { deviceToken: 'good-token' },
      { deviceToken: 'bad-token' },
    ]);
    sendEachForMulticast.mockResolvedValue({
      responses: [
        { success: true },
        {
          success: false,
          error: {
            code: 'messaging/registration-token-not-registered',
            message: 'not registered',
          },
        },
      ],
    });
    repository.deleteByDeviceTokens.mockResolvedValue({ count: 1 });

    await service.notifyVoluntaryAiMessage(1n, {
      chatroomId: '5',
      chatroomName: 'Room A',
      messagePreview: 'Hello world',
    });

    expect(sendEachForMulticast).toHaveBeenCalled();
    type MulticastArg = {
      tokens: string[];
      notification: { title: string };
      data: Record<string, string>;
    };
    const calls = sendEachForMulticast.mock.calls as unknown as [
      MulticastArg,
    ][];
    const payload = calls[0]?.[0];
    if (!payload) {
      throw new Error('expected sendEachForMulticast payload');
    }
    expect(payload.tokens).toEqual(['good-token', 'bad-token']);
    expect(payload.notification.title).toBe('New message in Room A');
    expect(payload.data.type).toBe('voluntary_ai_message');
    expect(payload.data.chatroomId).toBe('5');
    expect(repository.deleteByDeviceTokens).toHaveBeenCalledWith(['bad-token']);
  });

  it('should skip when no tokens', async () => {
    repository.findDeviceTokensByUserId.mockResolvedValue([]);

    await service.notifyVoluntaryAiMessage(1n, { chatroomId: '1' });

    expect(sendEachForMulticast).not.toHaveBeenCalled();
  });
});
