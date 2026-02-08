import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // 認証チェック（セッション確認）
    // ここでは簡易的にスキップ（実際にはミドルウェアやセッションでチェック）

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('users GET error', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'name and email are required' }, { status: 400 })
    }

    const user = await prisma.user.create({
      data: {
        uid: email, // uid を email で
        name,
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('users POST error', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}