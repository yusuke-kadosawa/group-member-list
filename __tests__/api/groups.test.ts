import request from 'supertest';
import { prisma } from '@/lib/prisma';

const TEST_USER = {
  email: 'test-group-user@example.com',
  name: 'テストユーザー',
  uid: 'test-group-uid',
};
const TEST_SESSION_TOKEN = 'test-session-token';
let testUserId;

describe('/api/groups API', () => {
  beforeAll(async () => {
    // テスト用ユーザー作成
    const user = await prisma.user.create({
      data: TEST_USER,
    });
    testUserId = user.id;
    // セッション作成
    await prisma.session.create({
      data: {
        sessionToken: TEST_SESSION_TOKEN,
        userId: user.id,
        expires: new Date(Date.now() + 1000 * 60 * 60),
      },
    });
  });

  afterAll(async () => {
    // クリーンアップ
    await prisma.session.deleteMany({ where: { sessionToken: TEST_SESSION_TOKEN } });
    await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
  });

  const api = request(process.env.TEST_BASE_URL || 'http://localhost:3001');

  it('GET /api/groups でグループ一覧が取得できる', async () => {
    const res = await api
      .get('/api/groups')
      .set('Cookie', `next-auth.session-token=${TEST_SESSION_TOKEN}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.groups)).toBe(true);
  });

  it('POST /api/groups でグループ作成（name必須）', async () => {
    const res = await api
      .post('/api/groups')
      .set('Cookie', `next-auth.session-token=${TEST_SESSION_TOKEN}`)
      .send({ name: 'テストグループ', description: 'テスト用' });
    expect(res.status).toBe(200);
    expect(res.body.group).toBeDefined();
    expect(res.body.group.name).toBe('テストグループ');
  });

  it('POST /api/groups でname未指定は400', async () => {
    const res = await api
      .post('/api/groups')
      .set('Cookie', `next-auth.session-token=${TEST_SESSION_TOKEN}`)
      .send({ description: 'no name' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('name required');
  });

  // 追加で詳細取得・更新・削除テストも実装可能
});
