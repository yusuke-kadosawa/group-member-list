import request from 'supertest';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

const TEST_USER = {
  email: 'test-group-invites-user@example.com',
  name: 'テスト招待ユーザー',
  uid: 'test-group-invites-uid',
};
const TEST_SESSION_TOKEN = 'test-group-invites-session-token';
let testGroupId: number;

const api = request(process.env.TEST_BASE_URL || 'http://localhost:3001');
const authCookie = `next-auth.session-token=${TEST_SESSION_TOKEN}`;

describe('/api/groups/[id]/invites API', () => {
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
        name: 'テスト招待グループ',
        groupUsers: {
          create: [{ userId: user.id, role: 3 }],
        },
      },
    });
    testGroupId = group.id;

    // 有効な招待トークンを1件作成
    await prisma.verificationToken.create({
      data: {
        identifier: 'pending@example.com',
        token: randomUUID(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        groupId: group.id,
      },
    });
    // 期限切れの招待トークンを1件作成（一覧に出ないはず）
    await prisma.verificationToken.create({
      data: {
        identifier: 'expired@example.com',
        token: randomUUID(),
        expires: new Date(Date.now() - 1000),
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

  describe('GET /api/groups/[id]/invites', () => {
    it('招待中一覧が取得できる（200）', async () => {
      const res = await api
        .get(`/api/groups/${testGroupId}/invites`)
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.invites)).toBe(true);
    });

    it('有効期限内の招待のみ返す', async () => {
      const res = await api
        .get(`/api/groups/${testGroupId}/invites`)
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      const emails = res.body.invites.map((i: { identifier: string }) => i.identifier);
      expect(emails).toContain('pending@example.com');
      expect(emails).not.toContain('expired@example.com');
    });

    it('レスポンスにidentifierとexpiresが含まれる', async () => {
      const res = await api
        .get(`/api/groups/${testGroupId}/invites`)
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(res.body.invites.length).toBeGreaterThan(0);
      const invite = res.body.invites[0];
      expect(invite.identifier).toBeDefined();
      expect(invite.expires).toBeDefined();
    });

    it('不正なidは400', async () => {
      const res = await api
        .get('/api/groups/abc/invites')
        .set('Cookie', authCookie);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid ID');
    });

    it('未認証は401', async () => {
      const res = await api.get(`/api/groups/${testGroupId}/invites`);
      expect(res.status).toBe(401);
    });
  });
});
