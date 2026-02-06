import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

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
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await prisma.session.create({ data: { sessionToken: token, userId: user.id, expires } })

    const res = NextResponse.json({ ok: true })
    // Set cookie (HttpOnly)
    res.cookies.set('next-auth.session-token', token, { httpOnly: true, path: '/', expires })
    return res
  } catch (e) {
    console.error('api/login error', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
