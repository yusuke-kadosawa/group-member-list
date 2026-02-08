import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function GET(req: Request) {
  console.log('API /auth/verify called')
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    console.log('Token:', token)
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token, expires: { gt: new Date() } }
    })
    console.log('VerificationToken found:', !!verificationToken)
    if (!verificationToken) return NextResponse.json({ error: 'invalid or expired token' }, { status: 400 })

    let user = await prisma.user.findFirst({ where: { email: verificationToken.identifier } })
    console.log('User found:', !!user)
    if (!user) {
      user = await prisma.user.create({ data: { uid: verificationToken.identifier, email: verificationToken.identifier, name: verificationToken.identifier.split('@')[0] } })
    }

    // Create session
    const sessionToken = randomUUID()
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await prisma.session.create({ data: { sessionToken, userId: user.id, expires } })
    console.log('Session created')

    // Delete verification token
    await prisma.verificationToken.delete({ where: { token } })
    console.log('VerificationToken deleted')

    const res = NextResponse.redirect(new URL('/home', req.url))
    // Set cookie (HttpOnly)
    res.cookies.set('next-auth.session-token', sessionToken, { httpOnly: true, path: '/', expires })
    console.log('Redirecting to /home with cookie')
    return res
  } catch (e) {
    console.error('api/auth/verify error', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}