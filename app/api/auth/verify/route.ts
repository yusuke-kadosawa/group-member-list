import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token')
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

    const verificationToken = await prisma.verificationToken.findFirst({
      where: { token, expires: { gt: new Date() } }
    })
    if (!verificationToken) return NextResponse.json({ error: 'invalid or expired token' }, { status: 400 })

    let user = await prisma.user.findFirst({ where: { email: verificationToken.identifier } })
    if (!user) {
      user = await prisma.user.create({ data: { uid: verificationToken.identifier, email: verificationToken.identifier, name: verificationToken.identifier.split('@')[0] } })
    }

    // Create session
    const sessionToken = randomUUID()
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await prisma.session.create({ data: { sessionToken, userId: user.id, expires } })

    // Delete verification token
    await prisma.verificationToken.delete({ where: { token } })

    const res = NextResponse.redirect(new URL('/home', req.url))
    // Set cookie (HttpOnly)
    res.cookies.set('next-auth.session-token', sessionToken, { httpOnly: true, path: '/', expires })
    return res
  } catch (e) {
    console.error('api/auth/verify error', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}