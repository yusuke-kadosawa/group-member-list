import request from 'supertest';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

const TEST_USER = {
  email: 'test-invite-accept-user@example.com',
  name: 'テスト招待受諾ユーザー',
  uid: 'test-invite-accept-uid',
};
const TEST_SESSION_TOKEN = 'test-invite-accept-session-token';
let testGroupId: number;
let inviteToken: string;

const api = request(process.env.TEST_BASE_URL || 'http://localhost:3000');
const authCookie = `next-auth.session-token=${TEST_SESSION_TOKEN}`;

describe('/api/groups/invite/accept API', () => {
  beforeAll(async () => {
    const user = await prisma.user.create({ data: TEST_USER });
    await prisma.session.create({
      data: {
        sessionToken: TEST_SESSION_TOKEN,
        userId: user.id,
        expires: new Date(Date.now() + 1000 * 60 * 60),
      },
    });
    const group = await prisma.group.create({
      data: {
        name: 'テスト招待受諾グループ',
      },
    });
    testGroupId = group.id;
    inviteToken = randomUUID();
    await prisma.verificationToken.create({
      data: {
        identifier: TEST_USER.email,
        token: inviteToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        groupId: group.id,
      },
    });
  });

  afterAll(async () => {
    await prisma.verificationToken.deleteMany({ where: { groupId: testGroupId } });
    await prisma.groupUser.deleteMany({ where: { groupId: testGroupId } });
    await prisma.group.deleteMany({ where: { id: testGroupId } });
    await prisma.session.deleteMany({ where: { sessionToken: TEST_SESSION_TOKEN } });
    await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
    await prisma.$disconnect();
  });

  it('有効なトークンでグループ参加できる', async () => {
    const res = await api
      .post('/api/groups/invite/accept')
      .set('Cookie', authCookie)
      .send({ token: inviteToken });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.groupId).toBe(testGroupId);
    // GroupUserが作成されていること
    const groupUser = await prisma.groupUser.findFirst({ where: { groupId: testGroupId, user: { email: TEST_USER.email } } });
    expect(groupUser).not.toBeNull();
  });

  it('同じトークンで2回目は409（already joined）', async () => {
    // 参加済みユーザー向けの新しい招待トークンでも409になることを検証
    const secondInviteToken = randomUUID();
    await prisma.verificationToken.create({
      data: {
        identifier: TEST_USER.email,
        token: secondInviteToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        groupId: testGroupId,
      },
    });

    const res = await api
      .post('/api/groups/invite/accept')
      .set('Cookie', authCookie)
      .send({ token: secondInviteToken });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('already joined');
  });

  it('無効なトークンは400', async () => {
    const res = await api
      .post('/api/groups/invite/accept')
      .set('Cookie', authCookie)
      .send({ token: 'invalid-token' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('invalid or expired token');
  });
});
