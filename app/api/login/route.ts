import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { sendEmail } from '@/lib/mailer'

/**
 * 認証メール本文を作成する
 * @param verificationUrl 検証リンクのURL
 */
function createVerificationEmailContent(verificationUrl: string) {
  const subject = 'グループメンバーリスト ログイン用リンクのお知らせ'
  const text = `こんにちは！\n\nグループメンバーリストへのログインリクエストを受け付けました。\n\n下記の安全な公式リンクからログインしてください（有効期限: 1時間）:\n${verificationUrl}\n\n※このメールに心当たりがない場合は、何もせず削除してください。\nこのメールは自動送信です。ご不明点は公式サイトからお問い合わせください。\n\nグループメンバーリスト運営チーム`
  return { subject, text }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = typeof body?.email === 'string' ? body.email : null
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

    // メールアドレス形式バリデーション（簡易）
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'invalid email' }, { status: 400 })
    }

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
    const { subject, text } = createVerificationEmailContent(verificationUrl)
    await sendEmail({ to: email, subject, text })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('api/login error', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
