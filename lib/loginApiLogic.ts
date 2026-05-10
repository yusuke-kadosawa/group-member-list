import { prisma } from './prisma';
import { randomUUID } from 'crypto';
import { sendEmail } from './mailer';

export async function loginApiLogic(email: string, baseUrl: string = 'http://localhost:3000') {
  if (!email || typeof email !== 'string') {
    return { status: 400, body: { error: 'email required' } };
  }
  let user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { uid: email, email, name: email.split('@')[0] } });
  }
  const token = randomUUID();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({ data: { identifier: email, token, expires } });
  const verificationUrl = `${baseUrl}/auth/verify?token=${token}`;
  const subject = 'グループメンバーリスト ログイン用リンクのお知らせ';
  const text = `こんにちは！\n\nグループメンバーリストへのログインリクエストを受け付けました。\n\n下記の安全な公式リンクからログインしてください（有効期限: 1時間）:\n${verificationUrl}\n\n※このメールに心当たりがない場合は、何もせず削除してください。\nこのメールは自動送信です。ご不明点は公式サイトからお問い合わせください。\n\nグループメンバーリスト運営チーム`;
  try {
    await sendEmail({ to: email, subject, text });
    return { status: 200, body: { ok: true } };
  } catch (e) {
    return { status: 500, body: { error: 'server error' } };
  }
}
