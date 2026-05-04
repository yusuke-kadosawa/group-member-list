import request from 'supertest';
import { prisma } from '@/lib/prisma';

const api = request(process.env.TEST_BASE_URL || 'http://localhost:3000');

describe('/api/places API', () => {
  let createdPlaceId: number;

  afterAll(async () => {
    await prisma.place.deleteMany({ where: { name: { startsWith: 'テスト' } } });
    await prisma.$disconnect();
  });

  describe('POST /api/places', () => {
    it('name必須で場所を作成できる（201）', async () => {
      const res = await api
        .post('/api/places')
        .send({ name: 'テスト場所', latitude: 35.6895, longitude: 139.6917 });
      if (res.status !== 201) {
        // エラー時にdebug情報も出力
        // eslint-disable-next-line no-console
        console.log('DEBUG:', res.body.debug);
      }
      expect(res.status).toBe(201);
      expect(res.body.place).toBeDefined();
      expect(res.body.place.name).toBe('テスト場所');
      expect(res.body.place.latitude).toBe(35.6895);
      createdPlaceId = res.body.place.id;
    });

    it('name未指定は400', async () => {
      const res = await api
        .post('/api/places')
        .send({ latitude: 35.6895 });
      if (res.status !== 400) {
        // エラー時にdebug情報も出力
        // eslint-disable-next-line no-console
        console.log('DEBUG:', res.body.debug);
      }
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('name required');
    });

    it('latitudeが範囲外（>90）は400', async () => {
      const res = await api
        .post('/api/places')
        .send({ name: 'テスト範囲外', latitude: 91 });
      if (res.status !== 400) {
        // エラー時にdebug情報も出力
        // eslint-disable-next-line no-console
        console.log('DEBUG:', res.body.debug);
      }
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('latitude must be between -90 and 90');
    });

    it('longitudeが範囲外（<-180）は400', async () => {
      const res = await api
        .post('/api/places')
        .send({ name: 'テスト範囲外', longitude: -181 });
      if (res.status !== 400) {
        // エラー時にdebug情報も出力
        // eslint-disable-next-line no-console
        console.log('DEBUG:', res.body.debug);
      }
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('longitude must be between -180 and 180');
    });
  });

  describe('GET /api/places', () => {
    it('場所一覧が取得できる（200）', async () => {
      const res = await api.get('/api/places');
      if (res.status !== 200) {
        // エラー時にdebug情報も出力
        // eslint-disable-next-line no-console
        console.log('DEBUG:', res.body.debug);
      }
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.places)).toBe(true);
    });
  });

  describe('GET /api/places/[id]', () => {
    it('作成した場所を取得できる（200）', async () => {
      const res = await api.get(`/api/places/${createdPlaceId}`);
      if (res.status !== 200) {
        // エラー時にdebug情報も出力
        // eslint-disable-next-line no-console
        console.log('DEBUG:', res.body.debug);
      }
      expect(res.status).toBe(200);
      expect(res.body.place.id).toBe(createdPlaceId);
      expect(res.body.place.name).toBe('テスト場所');
    });

    it('存在しないidは404', async () => {
      const res = await api.get('/api/places/999999');
      if (res.status !== 404) {
        // エラー時にdebug情報も出力
        // eslint-disable-next-line no-console
        console.log('DEBUG:', res.body.debug);
      }
      expect(res.status).toBe(404);
    });

    it('不正なidは400', async () => {
      const res = await api.get('/api/places/abc');
      if (res.status !== 400) {
        // エラー時にdebug情報も出力
        // eslint-disable-next-line no-console
        console.log('DEBUG:', res.body.debug);
      }
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('invalid id');
    });
  });

  describe('PUT /api/places/[id]', () => {
    it('場所を更新できる（200）', async () => {
      const res = await api
        .put(`/api/places/${createdPlaceId}`)
        .send({ name: 'テスト場所更新', latitude: 34.6937, longitude: 135.5023 });
      if (res.status !== 200) {
        // エラー時にdebug情報も出力
        // eslint-disable-next-line no-console
        console.log('DEBUG:', res.body.debug);
      }
      expect(res.status).toBe(200);
      expect(res.body.place.name).toBe('テスト場所更新');
      expect(res.body.place.latitude).toBe(34.6937);
    });

    it('name未指定は400', async () => {
      const res = await api
        .put(`/api/places/${createdPlaceId}`)
        .send({ latitude: 35.0 });
      if (res.status !== 400) {
        // エラー時にdebug情報も出力
        // eslint-disable-next-line no-console
        console.log('DEBUG:', res.body.debug);
      }
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('name required');
    });
  });

  describe('DELETE /api/places/[id]', () => {
    it('場所を削除できる（200）', async () => {
      const res = await api.delete(`/api/places/${createdPlaceId}`);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it('削除後はGETで404', async () => {
      const res = await api.get(`/api/places/${createdPlaceId}`);
      expect(res.status).toBe(404);
    });

    it('不正なidは400', async () => {
      const res = await api.delete('/api/places/abc');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('invalid id');
    });
  });
});
