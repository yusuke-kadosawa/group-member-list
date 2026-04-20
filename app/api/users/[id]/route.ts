import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// @ts-expect-error Next.js 15 API Route signature
export async function GET(req, { params }) {
  const { id } = await params
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('users GET error', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

// @ts-expect-error Next.js 15 API Route signature
export async function PUT(req, { params }) {
  const { id } = await params
  try {
    const body = await req.json()
    const { name, email } = body

    if (!name && !email) {
      return NextResponse.json({ error: 'At least name or email is required' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(email && { email }),
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
    console.error('users PUT error', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

// @ts-expect-error Next.js 15 API Route signature
export async function DELETE(req, { params }) {
  const { id } = await params
  try {
    await prisma.user.delete({
      where: { id: Number(id) },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('users DELETE error', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
