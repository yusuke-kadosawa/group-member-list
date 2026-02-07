import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    }

    const group = await prisma.group.findUnique({
      where: { id },
    })

    if (!group) {
      return NextResponse.json({ error: 'group not found' }, { status: 404 })
    }

    return NextResponse.json({ group })
  } catch (e) {
    console.error(`/api/groups/${params.id} GET error`, e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }

    const group = await prisma.group.update({
      where: { id },
      data: {
        name,
        description: description || null,
      },
    })

    return NextResponse.json({ group })
  } catch (e) {
    console.error(`/api/groups/${params.id} PUT error`, e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    }

    await prisma.group.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(`/api/groups/${params.id} DELETE error`, e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
