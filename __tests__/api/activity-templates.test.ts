import request from 'supertest';
import { prisma } from '@/lib/prisma';

const api = request(process.env.TEST_BASE_URL || 'http://localhost:3001');

const TEST_USER = {
  email: 'test-at-user@example.com',
  name: 'テストテンプレートユーザー',
  uid: 'test-at-uid',
};
const TEST_SESSION_TOKEN = 'test-at-session-token';
const authCookie = `next-auth.session-token=${TEST_SESSION_TOKEN}`;

describe('/api/activity-templates API', () => {
  let testPlaceId: number;
  let createdTemplateId: number;

  beforeAll(async () => {
    const user = await prisma.user.create({ data: TEST_USER });
    await prisma.session.create({
      data: {
        sessionToken: TEST_SESSION_TOKEN,
        userId: user.id,
        expires: new Date(Date.now() + 1000 * 60 * 60),
      },
    });
    const place = await prisma.place.create({
      data: { name: 'テスト場所AT', latitude: 35.3036, longitude: 139.2531 },
    });
    testPlaceId = place.id;
  });

  afterAll(async () => {
    await prisma.activityTemplate.deleteMany({ where: { name: { startsWith: 'テスト' } } });
    await prisma.place.deleteMany({ where: { name: 'テスト場所AT' } });
    await prisma.session.deleteMany({ where: { sessionToken: TEST_SESSION_TOKEN } });
    await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
    await prisma.$disconnect();
  });

  // -------------------------
  // POST /api/activity-templates
  // -------------------------
  describe('POST /api/activity-templates', () => {
    it('whenType=0（日付）で作成できる（201）', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ name: 'テスト日付', whenType: 0, when: '2026-03-30' });
      expect(res.status).toBe(201);
      expect(res.body.activityTemplate).toBeDefined();
      expect(res.body.activityTemplate.name).toBe('テスト日付');
      expect(res.body.activityTemplate.whenType).toBe(0);
      expect(res.body.activityTemplate.when).toBe('2026-03-30');
      expect(res.body.activityTemplate.place).toBeNull();
    });

    it('whenType=1（曜日）で作成できる（201）', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ name: 'テスト曜日', whenType: 1, when: '1' });
      expect(res.status).toBe(201);
      expect(res.body.activityTemplate.whenType).toBe(1);
      expect(res.body.activityTemplate.when).toBe('1');
      createdTemplateId = res.body.activityTemplate.id;
    });

    it('whenType=2（時刻）で作成できる（201）', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ name: 'テスト時刻', whenType: 2, when: '10:00' });
      expect(res.status).toBe(201);
      expect(res.body.activityTemplate.whenType).toBe(2);
    });

    it('placeId 指定で place オブジェクトが include される（201）', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ name: 'テスト場所付き', whenType: 2, when: '09:00', placeId: testPlaceId });
      expect(res.status).toBe(201);
      expect(res.body.activityTemplate.place).not.toBeNull();
      expect(res.body.activityTemplate.place.id).toBe(testPlaceId);
    });

    it('description 有で作成できる（201）', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ name: 'テスト説明付き', whenType: 1, when: '3', description: '説明テキスト' });
      expect(res.status).toBe(201);
      expect(res.body.activityTemplate.description).toBe('説明テキスト');
    });

    it('name 未指定は 400', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ whenType: 0, when: '2026-03-30' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('name required');
    });

    it('name 空文字は 400', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ name: '', whenType: 0, when: '2026-03-30' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('name required');
    });

    it('whenType 未指定は 400', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ name: 'テスト', when: '2026-03-30' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('whenType required');
    });

    it('whenType=3（不正値）は 400', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ name: 'テスト', whenType: 3, when: '2026-03-30' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('invalid whenType');
    });

    it('when 未指定は 400', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ name: 'テスト', whenType: 0 });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('when required');
    });

    it('whenType=0 / when フォーマット不正（区切りなし）は 400', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ name: 'テスト', whenType: 0, when: '20260330' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('invalid when format');
    });

    it('whenType=0 / 存在しない日付（2/30）は 400', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ name: 'テスト', whenType: 0, when: '2026-02-30' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('invalid when format');
    });

    it('whenType=1 / when="7" は 400', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ name: 'テスト', whenType: 1, when: '7' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('invalid when format');
    });

    it('whenType=1 / when="a" は 400', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ name: 'テスト', whenType: 1, when: 'a' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('invalid when format');
    });

    it('whenType=2 / when="24:00" は 400', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ name: 'テスト', whenType: 2, when: '24:00' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('invalid when format');
    });

    it('whenType=2 / when="10:60" は 400', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ name: 'テスト', whenType: 2, when: '10:60' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('invalid when format');
    });

    it('placeId が存在しない ID は 400', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ name: 'テスト', whenType: 1, when: '1', placeId: 999999 });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('place not found');
    });

    it('未認証は 401', async () => {
      const res = await api
        .post('/api/activity-templates')
        .send({ name: 'テスト', whenType: 1, when: '1' });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('unauthorized');
    });

    // 境界値
    it('whenType=1 / when="0"（日曜）は正常（201）', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ name: 'テスト境界日曜', whenType: 1, when: '0' });
      expect(res.status).toBe(201);
    });

    it('whenType=1 / when="6"（土曜）は正常（201）', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ name: 'テスト境界土曜', whenType: 1, when: '6' });
      expect(res.status).toBe(201);
    });

    it('whenType=2 / when="00:00" は正常（201）', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ name: 'テスト境界0時', whenType: 2, when: '00:00' });
      expect(res.status).toBe(201);
    });

    it('whenType=2 / when="23:59" は正常（201）', async () => {
      const res = await api
        .post('/api/activity-templates')
        .set('Cookie', authCookie)
        .send({ name: 'テスト境界2359', whenType: 2, when: '23:59' });
      expect(res.status).toBe(201);
    });
  });

  // -------------------------
  // GET /api/activity-templates
  // -------------------------
  describe('GET /api/activity-templates', () => {
    it('テンプレート一覧が取得できる（200）', async () => {
      const res = await api
        .get('/api/activity-templates')
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.activityTemplates)).toBe(true);
    });

    it('一覧は id 昇順', async () => {
      const res = await api
        .get('/api/activity-templates')
        .set('Cookie', authCookie);
      const ids: number[] = res.body.activityTemplates.map((t: any) => t.id);
      expect(ids).toEqual([...ids].sort((a, b) => a - b));
    });

    it('placeId フィルタで絞り込める（200）', async () => {
      const res = await api
        .get(`/api/activity-templates?placeId=${testPlaceId}`)
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      for (const t of res.body.activityTemplates) {
        expect(t.placeId).toBe(testPlaceId);
      }
    });

    it('存在しない placeId フィルタは空配列（200）', async () => {
      const res = await api
        .get('/api/activity-templates?placeId=999999')
        .set('Cookie', authCookie);
      expect(res.status).toBe(200);
      expect(res.body.activityTemplates).toEqual([]);
    });

    it('未認証は 401', async () => {
      const res = await api.get('/api/activity-templates');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('unauthorized');
    });
  });
});
