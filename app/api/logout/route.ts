import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('next-auth.session-token')?.value

    // DB のセッションを削除
    if (token) {
      await prisma.session.delete({
        where: { sessionToken: token },
      }).catch(() => {
        // セッションが既に存在しない場合は無視
      })
    }

    // クッキーを削除
    const response = NextResponse.json({ success: true })
    response.cookies.set('next-auth.session-token', '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error('logout error', error)
    return NextResponse.json({ error: 'logout failed' }, { status: 500 })
  }
}
