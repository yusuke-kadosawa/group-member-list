import { sendEmail } from './mailer'

/**
 * 認証メールを送信する
 * @param email 受信者のメールアドレス
 * @param verificationUrl 検証リンクのURL
 */
export async function sendVerificationEmail(email: string, verificationUrl: string): Promise<void> {
  const subject = 'ログインリンク'
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>ログインリンク</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333;">グループメンバーリストにログイン</h1>
      <p>以下のリンクをクリックしてログインしてください：</p>
      <p style="margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          ログインする
        </a>
      </p>
      <p>このリンクは1時間以内に有効期限が切れます。</p>
      <p>※ このメールに心当たりがない場合は無視してください。</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        このメールは自動送信されています。返信しないでください。
      </p>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject,
    html,
  })
}