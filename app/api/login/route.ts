import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { sendEmail } from '@/lib/mailer'

/**
 * 認証メール本文を作成する
 * @param verificationUrl 検証リンクのURL
 */
function createVerificationEmailContent(verificationUrl: string) {
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
  return { subject, html }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = typeof body?.email === 'string' ? body.email : null
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

    let user = await prisma.user.findFirst({ where: { email } })
    if (!user) {
      user = await prisma.user.create({ data: { uid: email, email, name: email.split('@')[0] } })
    }

    const token = randomUUID()
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Delete any existing verification tokens for this email
    await prisma.verificationToken.deleteMany({ where: { identifier: email } })

    console.log('Creating token:', token, 'expires:', expires.toISOString(), 'current time:', new Date().toISOString())
    await prisma.verificationToken.create({ data: { identifier: email, token, expires } })

    // Send email with verification URL
    const baseUrl = process.env.APP_URL || 'http://localhost:3000'
    const verificationUrl = `${baseUrl}/auth/verify?token=${token}`
    const { subject, html } = createVerificationEmailContent(verificationUrl)
    await sendEmail({ to: email, subject, html })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('api/login error', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
