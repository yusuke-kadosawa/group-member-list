import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const start = Date.now()
  try {
    const groups = await prisma.group.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    const duration = Date.now() - start
    console.log(`[groups] GET completed in ${duration}ms`)

    return NextResponse.json({ groups })
  } catch (e) {
    console.error('/api/groups error', e)
    const duration = Date.now() - start
    console.log(`[groups] GET failed in ${duration}ms`)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const start = Date.now()
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

    const duration = Date.now() - start
    console.log(`[groups] POST completed in ${duration}ms`)

    return NextResponse.json({ group })
  } catch (e) {
    console.error('/api/groups POST error', e)
    const duration = Date.now() - start
    console.log(`[groups] POST failed in ${duration}ms`)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
