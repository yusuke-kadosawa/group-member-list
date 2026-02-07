import nodemailer from 'nodemailer'

/**
 * 環境に応じた nodemailer transporter を作成
 * - 開発環境: MailDev (localhost:1025)
 * - 本番環境: 環境変数で設定された SMTP サーバー
 */
export function createMailTransporter() {
  if (process.env.NODE_ENV === 'development') {
    // 開発環境: MailDev
    return nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      secure: false,
      ignoreTLS: true,
    })
  } else {
    // 本番環境: Resend, SendGrid, AWS SES など
    const host = process.env.SMTP_HOST
    const port = parseInt(process.env.SMTP_PORT || '587')
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    if (!host || !user || !pass) {
      throw new Error('SMTP configuration is missing. Set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.')
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user,
        pass,
      },
    })
  }
}

/**
 * メール送信ヘルパー
 */
export async function sendEmail(options: {
  to: string | string[]
  subject: string
  html: string
  from?: string
}) {
  const transporter = createMailTransporter()
  const from = options.from || process.env.MAIL_FROM || 'noreply@example.com'

  const info = await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  })

  console.log('[sendEmail] Message sent:', info.messageId)
  if (process.env.NODE_ENV === 'development') {
    console.log('[sendEmail] Preview URL: http://localhost:1080')
  }

  return info
}
