import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ groups })
  } catch (e) {
    console.error('/api/groups error', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }

    const group = await prisma.group.create({
      data: {
        name,
        description: description || null,
      },
    })

    return NextResponse.json({ group })
  } catch (e) {
    console.error('/api/groups POST error', e)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
