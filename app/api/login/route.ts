import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { sendVerificationEmail } from '@/lib/email'

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
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour
    
    // Delete any existing verification tokens for this email
    await prisma.verificationToken.deleteMany({ where: { identifier: email } })
    
    console.log('Creating token:', token, 'expires:', expires.toISOString())
    await prisma.verificationToken.create({ data: { identifier: email, token, expires } })

    // TODO: Send email with verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`
    await sendVerificationEmail(email, verificationUrl)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('api/login error', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
