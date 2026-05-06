// --- DB接続確認テスト ---
describe('環境セットアップ', () => {
  it('PrismaでDB接続できる', async () => {
    await expect(prisma.$queryRaw`SELECT 1`).resolves.toBeDefined();
  });
});
import fs from 'fs';
import request from 'supertest';
import { prisma } from '@/lib/prisma';

const TEST_USER = {
  email: 'test-activity-user@example.com',
  name: 'テスト活動ユーザー',
  uid: 'test-activity-uid',
};
const TEST_SESSION_TOKEN = 'test-activity-session-token';
let testUserId: number;
let createdActivityId: number;

const api = request(process.env.TEST_BASE_URL || 'http://localhost:3000');
const authCookie = `next-auth.session-token=${TEST_SESSION_TOKEN}`;

describe('/api/activities API', () => {
  beforeAll(async () => {
    const user = await prisma.user.create({ data: TEST_USER });
    testUserId = user.id;
    await prisma.session.create({
      data: {
        sessionToken: TEST_SESSION_TOKEN,
        userId: user.id,
        expires: new Date(Date.now() + 1000 * 60 * 60),
      },
    });
  });

  afterAll(async () => {
    if (createdActivityId != null) {
      await prisma.activityUser.deleteMany({ where: { activityId: createdActivityId } });
      await prisma.activityGroup.deleteMany({ where: { activityId: createdActivityId } });
    }
    await prisma.activity.deleteMany({ where: { name: { startsWith: 'テスト活動' } } });
    await prisma.session.deleteMany({ where: { sessionToken: TEST_SESSION_TOKEN } });
    await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
    await prisma.$disconnect();
  });

  describe('POST /api/activities', () => {
    it('name・startedAt必須で活動を作成できる（201）', async () => {
      // 現在時刻より1日後を設定
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const res = await api
        .post('/api/activities')
        .set('Cookie', authCookie)
        .send({ name: 'テスト活動', startedAt: futureDate });
      if (res.status !== 201) {
        // エラー時に詳細デバッグ情報を出力
        // eslint-disable-next-line no-console
        console.log('POST /api/activities error:', {
          status: res.status,
          body: res.body,
          text: res.text,
          headers: res.headers,
          error: res.error,
        });
      }
      if (res.status !== 201) {
        // エラー時にdebug情報も出力
        // eslint-disable-next-line no-console
        console.log('DEBUG:', res.body.debug);
      }
      expect(res.status).toBe(201);
      expect(res.body.activity).toBeDefined();
      expect(res.body.activity.name).toBe('テスト活動');
      expect(res.body.activity.id).toBeDefined();
      createdActivityId = res.body.activity.id;
    });

    it('name未指定は400', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const res = await api
        .post('/api/activities')
        .set('Cookie', authCookie)
        .send({ startedAt: futureDate });
      if (res.status !== 400) {
        // エラー時にdebug情報も出力
        // eslint-disable-next-line no-console
        console.log('DEBUG:', res.body.debug);
      }
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('name and startedAt are required');
    });

    it('startedAt未指定は400', async () => {
      const res = await api
        .post('/api/activities')
        .set('Cookie', authCookie)
        .send({ name: 'テスト活動' });
      if (res.status !== 400) {
        // エラー時にdebug情報も出力
        // eslint-disable-next-line no-console
        console.log('DEBUG:', res.body.debug);
      }
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('name and startedAt are required');
    });

    it('未認証は401', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const res = await api
        .post('/api/activities')
        .send({ name: 'テスト活動', startedAt: futureDate });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/activities', () => {
    it('活動一覧が取得できる（200）', async () => {
      const res = await api.get('/api/activities').set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.activities)).toBe(true);
    });

    it('未認証は401', async () => {
      const res = await api.get('/api/activities');
      expect(res.status).toBe(401);
    });

    it('status=upcomingフィルターが機能する（200）', async () => {
      const res = await api
        .get('/api/activities?status=upcoming')
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.activities)).toBe(true);
      expect(
        res.body.activities.some((activity: any) => activity.id === createdActivityId),
      ).toBe(true);
      if (!res.body.activities.some((activity) => activity.id === createdActivityId)) {
        // 失敗時にAPIレスポンスをファイル出力
        try {
            fs.writeFileSync('/app/upcoming-debug.json', JSON.stringify(res.body));
        } catch (e) {
          // ignore
        }
        throw new Error('status=upcoming API response mismatch');
      }
    });
  });

  describe('GET /api/activities/[id]', () => {
    it('作成した活動を取得できる（200）', async () => {
      const res = await api
        .get(`/api/activities/${createdActivityId}`)
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(res.body.activity.id).toBe(createdActivityId);
      expect(res.body.activity.name).toBe('テスト活動');
    });

    it('存在しないidは404', async () => {
      const res = await api
        .get('/api/activities/999999')
        .set('Cookie', authCookie);
      expect(res.status).toBe(404);
    });

    it('不正なidは400', async () => {
      const res = await api
        .get('/api/activities/abc')
        .set('Cookie', authCookie);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid ID');
    });

    it('未認証は401', async () => {
      const res = await api.get(`/api/activities/${createdActivityId}`);
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/activities/[id]', () => {
    it('活動を更新できる（200）', async () => {
      const res = await api
        .put(`/api/activities/${createdActivityId}`)
        .set('Cookie', authCookie)
        .send({ name: 'テスト活動（更新済み）' });
      expect(res.status).toBe(200);
      expect(res.body.activity.name).toBe('テスト活動（更新済み）');
    });

    it('存在しないidは404', async () => {
      const res = await api
        .put('/api/activities/999999')
        .set('Cookie', authCookie)
        .send({ name: 'テスト活動' });
      expect(res.status).toBe(404);
    });

    it('不正なidは400', async () => {
      const res = await api
        .put('/api/activities/abc')
        .set('Cookie', authCookie)
        .send({ name: 'テスト活動' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid ID');
    });

    it('未認証は401', async () => {
      const res = await api
        .put(`/api/activities/${createdActivityId}`)
        .send({ name: 'テスト活動' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/activities/[id]/participants', () => {
    it('参加者を追加できる（201）', async () => {
      const res = await api
        .post(`/api/activities/${createdActivityId}/participants`)
        .set('Cookie', authCookie)
        .send({ userId: testUserId, status: 0 });
      expect(res.status).toBe(201);
      expect(res.body.participant).toBeDefined();
      expect(res.body.participant.userId).toBe(testUserId);
    });

    it('同じユーザーを重複追加すると409', async () => {
      const res = await api
        .post(`/api/activities/${createdActivityId}/participants`)
        .set('Cookie', authCookie)
        .send({ userId: testUserId });
      expect(res.status).toBe(409);
      expect(res.body.error).toBe('User already participating');
    });

    it('userId未指定は400', async () => {
      const res = await api
        .post(`/api/activities/${createdActivityId}/participants`)
        .set('Cookie', authCookie)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('userId is required');
    });

    it('未認証は401', async () => {
      const res = await api
        .post(`/api/activities/${createdActivityId}/participants`)
        .send({ userId: testUserId });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/activities/[id]/participants', () => {
    it('参加者一覧が取得できる（200）', async () => {
      const res = await api
        .get(`/api/activities/${createdActivityId}/participants`)
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.participants)).toBe(true);
      expect(res.body.participants.length).toBeGreaterThan(0);
    });

    it('未認証は401', async () => {
      const res = await api.get(`/api/activities/${createdActivityId}/participants`);
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/activities/[id]/participants/[userId]', () => {
    it('参加者のステータスを更新できる（200）', async () => {
      const res = await api
        .put(`/api/activities/${createdActivityId}/participants/${testUserId}`)
        .set('Cookie', authCookie)
        .send({ status: 1 });
      expect(res.status).toBe(200);
      expect(res.body.participant.status).toBe(1);
    });

    it('status未指定は400', async () => {
      const res = await api
        .put(`/api/activities/${createdActivityId}/participants/${testUserId}`)
        .set('Cookie', authCookie)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('status is required');
    });

    it('存在しない参加者は404', async () => {
      const res = await api
        .put(`/api/activities/${createdActivityId}/participants/999999`)
        .set('Cookie', authCookie)
        .send({ status: 1 });
      expect(res.status).toBe(404);
    });

    it('未認証は401', async () => {
      const res = await api
        .put(`/api/activities/${createdActivityId}/participants/${testUserId}`)
        .send({ status: 1 });
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/activities/[id]/participants/[userId]', () => {
    it('参加者を削除できる（200）', async () => {
      const res = await api
        .delete(`/api/activities/${createdActivityId}/participants/${testUserId}`)
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it('未認証は401', async () => {
      const res = await api.delete(
        `/api/activities/${createdActivityId}/participants/${testUserId}`
      );
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/activities/[id]', () => {
    it('活動を削除できる（200）', async () => {
      const res = await api
        .delete(`/api/activities/${createdActivityId}`)
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it('削除後はGETで404', async () => {
      const res = await api
        .get(`/api/activities/${createdActivityId}`)
        .set('Cookie', authCookie);
      expect(res.status).toBe(404);
    });

    it('存在しないidは404（not found）', async () => {
      const res = await api
        .delete('/api/activities/999999')
        .set('Cookie', authCookie);
      expect(res.status).toBe(404);
    });

    it('不正なidは400', async () => {
      const res = await api
        .delete('/api/activities/abc')
        .set('Cookie', authCookie);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid ID');
    });

    it('未認証は401', async () => {
      const res = await api.delete(`/api/activities/${createdActivityId}`);
      expect(res.status).toBe(401);
    });
  });
});
