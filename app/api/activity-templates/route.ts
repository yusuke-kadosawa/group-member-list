import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

/** when フォーマットを whenType に従って検証する */
function validateWhen(whenType: number, when: string): string | null {
  if (whenType === 0) {
    // YYYY-MM-DD かつ実在する日付
    if (!/^\d{4}-\d{2}-\d{2}$/.test(when)) return 'invalid when format'
    const [year, month, day] = when.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    if (d.getFullYear() !== year || d.getMonth() + 1 !== month || d.getDate() !== day) {
      return 'invalid when format'
    }
    return null
  }
  if (whenType === 1) {
    // "0" 〜 "6"
    if (!/^[0-6]$/.test(when)) return 'invalid when format'
    return null
  }
  if (whenType === 2) {
    // HH:MM（00:00 〜 23:59）
    if (!/^\d{2}:\d{2}$/.test(when)) return 'invalid when format'
    const [hh, mm] = when.split(':').map(Number)
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return 'invalid when format'
    return null
  }
  return 'invalid whenType'
}

export async function GET(req: NextRequest) {
  const start = Date.now()
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const placeIdParam = searchParams.get('placeId')

    const where: Record<string, unknown> = {}
    if (placeIdParam !== null) {
      const placeId = parseInt(placeIdParam)
      if (isNaN(placeId)) {
        return NextResponse.json({ error: 'invalid placeId' }, { status: 400 })
      }
      where.placeId = placeId
    }

    const activityTemplates = await prisma.activityTemplate.findMany({
      where,
      include: { place: true },
      orderBy: { id: 'asc' },
    })

    const duration = Date.now() - start
    console.log(`[activity-templates] GET completed in ${duration}ms`)

    return NextResponse.json({ activityTemplates })
  } catch (e) {
    console.error('/api/activity-templates GET error', e)
    const duration = Date.now() - start
    console.log(`[activity-templates] GET failed in ${duration}ms`)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const start = Date.now()
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, whenType, when, placeId } = body

    // name バリデーション
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }

    // whenType バリデーション
    if (whenType === undefined || whenType === null) {
      return NextResponse.json({ error: 'whenType required' }, { status: 400 })
    }
    if (![0, 1, 2].includes(whenType)) {
      return NextResponse.json({ error: 'invalid whenType' }, { status: 400 })
    }

    // when バリデーション（必須）
    if (!when || typeof when !== 'string' || when.trim() === '') {
      return NextResponse.json({ error: 'when required' }, { status: 400 })
    }
    const whenError = validateWhen(whenType, when)
    if (whenError) {
      return NextResponse.json({ error: whenError }, { status: 400 })
    }

    // placeId 存在チェック
    if (placeId !== undefined && placeId !== null) {
      const place = await prisma.place.findUnique({ where: { id: placeId } })
      if (!place) {
        return NextResponse.json({ error: 'place not found' }, { status: 400 })
      }
    }

    const activityTemplate = await prisma.activityTemplate.create({
      data: {
        name: name.trim(),
        description: description ?? null,
        whenType,
        when,
        placeId: placeId ?? null,
      },
      include: { place: true },
    })

    const duration = Date.now() - start
    console.log(`[activity-templates] POST completed in ${duration}ms`)

    return NextResponse.json({ activityTemplate }, { status: 201 })
  } catch (e) {
    console.error('/api/activity-templates POST error', e)
    const duration = Date.now() - start
    console.log(`[activity-templates] POST failed in ${duration}ms`)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
