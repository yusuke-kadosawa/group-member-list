
// fetchを使ってNext.jsサーバのAPIエンドポイントを直接テスト
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('/api/login', () => {

  it('有効なメールアドレスでリクエストすると200+メール送信', async () => {
    const res = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'valid@example.com' })
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
  });

  it('email未指定は400', async () => {
    const res = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });


  it('不正なメールは400', async () => {
    const res = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'abc' })
    });
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  // 送信失敗・レートリミット・サーバーエラー等はモックや環境依存のため省略
});
