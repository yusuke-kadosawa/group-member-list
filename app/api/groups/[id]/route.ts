import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const start = Date.now()
  try {
    const groupId = parseInt(id)
    if (isNaN(groupId)) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    })

    if (!group) {
      return NextResponse.json({ error: 'group not found' }, { status: 404 })
    }

    const duration = Date.now() - start
    console.log(`[groups/${id}] GET completed in ${duration}ms`)
    return NextResponse.json({ group })
  } catch (e) {
    console.error(`/api/groups/${id} GET error`, e)
    const duration = Date.now() - start
    console.log(`[groups/${id}] GET failed in ${duration}ms`)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const start = Date.now()
  try {
    const groupId = parseInt(id)
    if (isNaN(groupId)) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }

    const group = await prisma.group.update({
      where: { id: groupId },
      data: {
        name,
        description: description || null,
      },
    })

    const duration = Date.now() - start
    console.log(`[groups/${id}] PUT completed in ${duration}ms`)
    return NextResponse.json({ group })
  } catch (e) {
    console.error(`/api/groups/${id} PUT error`, e)
    const duration = Date.now() - start
    console.log(`[groups/${id}] PUT failed in ${duration}ms`)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const start = Date.now()
  try {
    const groupId = parseInt(id)
    if (isNaN(groupId)) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    }

    await prisma.group.delete({
      where: { id: groupId },
    })

    const duration = Date.now() - start
    console.log(`[groups/${id}] DELETE completed in ${duration}ms`)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(`/api/groups/${id} DELETE error`, e)
    const duration = Date.now() - start
    console.log(`[groups/${id}] DELETE failed in ${duration}ms`)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
