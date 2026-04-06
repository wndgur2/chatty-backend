/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

describe('ChatroomsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdChatroomId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    const userOne = await prisma.user.findUnique({ where: { id: 1n } });
    if (!userOne) {
      await prisma.user.create({
        data: { id: 1n, username: 'testuser_chatrooms' },
      });
    }
  });

  afterAll(async () => {
    // Intentionally leaving 'where: { userId: 1n }' records in the database so they can be inspected.
    // await prisma.chatroom.deleteMany({
    //   where: { userId: 1n },
    // });
    await app.close();
  });

  it('/api/chatrooms (POST) - create a chatroom', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/chatrooms')
      .field('name', 'E2E Chatroom')
      .field('basePrompt', 'You are an e2e test bot.');

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('E2E Chatroom');

    const dbRecord = await prisma.chatroom.findFirst({
      where: { name: 'E2E Chatroom' },
    });

    expect(dbRecord).toBeTruthy();
    expect(dbRecord?.basePrompt).toBe('You are an e2e test bot.');

    createdChatroomId = res.body.id;
  });

  it('/api/chatrooms (GET) - list chatrooms', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/chatrooms')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    const result = res.body.find((c: any) => c.id === createdChatroomId);
    expect(result).toBeDefined();
    expect(result.name).toBe('E2E Chatroom');
  });

  it('/api/chatrooms/:id (GET) - read one chatroom', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/chatrooms/${createdChatroomId}`)
      .expect(200);

    expect(res.body.id).toBe(createdChatroomId);
    expect(res.body.name).toBe('E2E Chatroom');
  });

  it('/api/chatrooms/:id (PATCH) - update chatroom', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/chatrooms/${createdChatroomId}`)
      .field('name', 'Updated E2E Chatroom')
      .expect(200);

    expect(res.body.name).toBe('Updated E2E Chatroom');

    const dbRecord = await prisma.chatroom.findUnique({
      where: { id: BigInt(createdChatroomId) },
    });
    expect(dbRecord?.name).toBe('Updated E2E Chatroom');
  });

  it('/api/chatrooms/:id (DELETE) - delete chatroom', async () => {
    await request(app.getHttpServer())
      .delete(`/api/chatrooms/${createdChatroomId}`)
      .expect(200);

    const dbRecord = await prisma.chatroom.findUnique({
      where: { id: BigInt(createdChatroomId) },
    });
    expect(dbRecord).toBeNull();
  });
});
