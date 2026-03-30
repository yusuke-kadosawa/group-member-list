import request from 'supertest';
import { prisma } from '@/lib/prisma';

const api = request(process.env.TEST_BASE_URL || 'http://localhost:3001');

const TEST_USER = {
  email: 'test-at-id-user@example.com',
  name: 'テストテンプレートIDユーザー',
  uid: 'test-at-id-uid',
};
const TEST_SESSION_TOKEN = 'test-at-id-session-token';
const authCookie = `next-auth.session-token=${TEST_SESSION_TOKEN}`;

describe('/api/activity-templates/[id] API', () => {
  let testPlaceId: number;
  let testPlaceId2: number;
  let templateId: number;

  beforeAll(async () => {
    const user = await prisma.user.create({ data: TEST_USER });
    await prisma.session.create({
      data: {
        sessionToken: TEST_SESSION_TOKEN,
        userId: user.id,
        expires: new Date(Date.now() + 1000 * 60 * 60),
      },
    });
    const place1 = await prisma.place.create({
      data: { name: 'テスト場所AT-ID-1', latitude: 35.0, longitude: 139.0 },
    });
    const place2 = await prisma.place.create({
      data: { name: 'テスト場所AT-ID-2', latitude: 36.0, longitude: 140.0 },
    });
    testPlaceId = place1.id;
    testPlaceId2 = place2.id;

    const template = await prisma.activityTemplate.create({
      data: { name: 'テスト週次', whenType: 1, when: '1', placeId: testPlaceId },
    });
    templateId = template.id;
  });

  afterAll(async () => {
    await prisma.activityTemplate.deleteMany({ where: { name: { startsWith: 'テスト' } } });
    await prisma.place.deleteMany({ where: { name: { startsWith: 'テスト場所AT-ID' } } });
    await prisma.session.deleteMany({ where: { sessionToken: TEST_SESSION_TOKEN } });
    await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
    await prisma.$disconnect();
  });

  // -------------------------
  // GET /api/activity-templates/[id]
  // -------------------------
  describe('GET /api/activity-templates/[id]', () => {
    it('存在する id でテンプレートを取得できる（200）', async () => {
      const res = await api
        .get(`/api/activity-templates/${templateId}`)
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(res.body.activityTemplate.id).toBe(templateId);
      expect(res.body.activityTemplate.name).toBe('テスト週次');
      expect(res.body.activityTemplate.place).not.toBeNull();
      expect(res.body.activityTemplate.place.id).toBe(testPlaceId);
    });

    it('placeId が null のテンプレートは place: null で返る（200）', async () => {
      const t = await prisma.activityTemplate.create({
        data: { name: 'テスト場所なし', whenType: 2, when: '08:00' },
      });
      const res = await api
        .get(`/api/activity-templates/${t.id}`)
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(res.body.activityTemplate.place).toBeNull();
    });

    it('存在しない id は 404', async () => {
      const res = await api
        .get('/api/activity-templates/999999')
        .set('Cookie', authCookie);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('not found');
    });

    it('id が数値でない場合は 400', async () => {
      const res = await api
        .get('/api/activity-templates/abc')
        .set('Cookie', authCookie);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('invalid id');
    });

    it('未認証は 401', async () => {
      const res = await api.get(`/api/activity-templates/${templateId}`);
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('unauthorized');
    });
  });

  // -------------------------
  // PUT /api/activity-templates/[id]
  // -------------------------
  describe('PUT /api/activity-templates/[id]', () => {
    it('name を更新できる（200）', async () => {
      const res = await api
        .put(`/api/activity-templates/${templateId}`)
        .set('Cookie', authCookie)
        .send({ name: 'テスト週次（改）' });
      expect(res.status).toBe(200);
      expect(res.body.activityTemplate.name).toBe('テスト週次（改）');
    });

    it('whenType + when をセットで更新できる（200）', async () => {
      const res = await api
        .put(`/api/activity-templates/${templateId}`)
        .set('Cookie', authCookie)
        .send({ whenType: 2, when: '10:00' });
      expect(res.status).toBe(200);
      expect(res.body.activityTemplate.whenType).toBe(2);
      expect(res.body.activityTemplate.when).toBe('10:00');
    });

    it('placeId を別 ID に更新できる（200）', async () => {
      const res = await api
        .put(`/api/activity-templates/${templateId}`)
        .set('Cookie', authCookie)
        .send({ placeId: testPlaceId2 });
      expect(res.status).toBe(200);
      expect(res.body.activityTemplate.placeId).toBe(testPlaceId2);
      expect(res.body.activityTemplate.place.id).toBe(testPlaceId2);
    });

    it('placeId を null に更新できる（200）', async () => {
      const res = await api
        .put(`/api/activity-templates/${templateId}`)
        .set('Cookie', authCookie)
        .send({ placeId: null });
      expect(res.status).toBe(200);
      expect(res.body.activityTemplate.placeId).toBeNull();
      expect(res.body.activityTemplate.place).toBeNull();
    });

    it('description を null に更新できる（200）', async () => {
      const res = await api
        .put(`/api/activity-templates/${templateId}`)
        .set('Cookie', authCookie)
        .send({ description: null });
      expect(res.status).toBe(200);
      expect(res.body.activityTemplate.description).toBeNull();
    });

    it('空ボディ {} は no-op として 200 を返す', async () => {
      const before = await api
        .get(`/api/activity-templates/${templateId}`)
        .set('Cookie', authCookie);
      const res = await api
        .put(`/api/activity-templates/${templateId}`)
        .set('Cookie', authCookie)
        .send({});
      expect(res.status).toBe(200);
      expect(res.body.activityTemplate.name).toBe(before.body.activityTemplate.name);
    });

    it('whenType のみ指定（when 省略）は 400', async () => {
      const res = await api
        .put(`/api/activity-templates/${templateId}`)
        .set('Cookie', authCookie)
        .send({ whenType: 1 });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('when required when whenType is specified');
    });

    it('when のみ指定（whenType 省略）は 400', async () => {
      const res = await api
        .put(`/api/activity-templates/${templateId}`)
        .set('Cookie', authCookie)
        .send({ when: '10:00' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('whenType required when when is specified');
    });

    it('placeId が存在しない ID は 400', async () => {
      const res = await api
        .put(`/api/activity-templates/${templateId}`)
        .set('Cookie', authCookie)
        .send({ placeId: 999999 });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('place not found');
    });

    it('whenType 不正値は 400', async () => {
      const res = await api
        .put(`/api/activity-templates/${templateId}`)
        .set('Cookie', authCookie)
        .send({ whenType: 5, when: '10:00' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('invalid whenType');
    });

    it('when フォーマット不正は 400', async () => {
      const res = await api
        .put(`/api/activity-templates/${templateId}`)
        .set('Cookie', authCookie)
        .send({ whenType: 2, when: '25:00' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('invalid when format');
    });

    it('存在しない id は 404', async () => {
      const res = await api
        .put('/api/activity-templates/999999')
        .set('Cookie', authCookie)
        .send({ name: '更新テスト' });
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('not found');
    });

    it('id が数値でない場合は 400', async () => {
      const res = await api
        .put('/api/activity-templates/abc')
        .set('Cookie', authCookie)
        .send({ name: '更新テスト' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('invalid id');
    });

    it('未認証は 401', async () => {
      const res = await api
        .put(`/api/activity-templates/${templateId}`)
        .send({ name: '更新テスト' });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('unauthorized');
    });
  });

  // -------------------------
  // DELETE /api/activity-templates/[id]
  // -------------------------
  describe('DELETE /api/activity-templates/[id]', () => {
    let deleteTargetId: number;

    beforeEach(async () => {
      const t = await prisma.activityTemplate.create({
        data: { name: 'テスト削除対象', whenType: 1, when: '0' },
      });
      deleteTargetId = t.id;
    });

    it('削除できる（200）', async () => {
      const res = await api
        .delete(`/api/activity-templates/${deleteTargetId}`)
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it('削除後に GET すると 404', async () => {
      await api
        .delete(`/api/activity-templates/${deleteTargetId}`)
        .set('Cookie', authCookie);
      const res = await api
        .get(`/api/activity-templates/${deleteTargetId}`)
        .set('Cookie', authCookie);
      expect(res.status).toBe(404);
    });

    it('存在しない id は 404', async () => {
      const res = await api
        .delete('/api/activity-templates/999999')
        .set('Cookie', authCookie);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('not found');
    });

    it('id が数値でない場合は 400', async () => {
      const res = await api
        .delete('/api/activity-templates/abc')
        .set('Cookie', authCookie);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('invalid id');
    });

    it('未認証は 401', async () => {
      const res = await api.delete(`/api/activity-templates/${deleteTargetId}`);
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('unauthorized');
    });
  });
});
