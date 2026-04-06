import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

/** when フォーマットを whenType に従って検証する */
function validateWhen(whenType: number, when: string): string | null {
  if (whenType === 0) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(when)) return 'invalid when format'
    const [year, month, day] = when.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    if (d.getFullYear() !== year || d.getMonth() + 1 !== month || d.getDate() !== day) {
      return 'invalid when format'
    }
    return null
  }
  if (whenType === 1) {
    if (!/^[0-6]$/.test(when)) return 'invalid when format'
    return null
  }
  if (whenType === 2) {
    if (!/^\d{2}:\d{2}$/.test(when)) return 'invalid when format'
    const [hh, mm] = when.split(':').map(Number)
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return 'invalid when format'
    return null
  }
  return 'invalid whenType'
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const start = Date.now()
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const templateId = parseInt(id)
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    }

    const activityTemplate = await prisma.activityTemplate.findUnique({
      where: { id: templateId },
      include: { place: true },
    })

    if (!activityTemplate) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    const duration = Date.now() - start
    console.log(`[activity-templates/${id}] GET completed in ${duration}ms`)

    return NextResponse.json({ activityTemplate })
  } catch (e) {
    console.error(`/api/activity-templates/${id} GET error`, e)
    const duration = Date.now() - start
    console.log(`[activity-templates/${id}] GET failed in ${duration}ms`)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const start = Date.now()
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const templateId = parseInt(id)
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    }

    const existing = await prisma.activityTemplate.findUnique({ where: { id: templateId } })
    if (!existing) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    const body = await req.json()
    const { name, description, whenType, when, placeId } = body

    // name バリデーション（指定された場合のみ）
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ error: 'name required' }, { status: 400 })
      }
    }

    // description は string | null のみ許可（指定された場合のみ）
    if (description !== undefined) {
      if (description !== null && typeof description !== 'string') {
        return NextResponse.json({ error: 'invalid description' }, { status: 400 })
      }
    }
    // whenType と when のセット強制
    const hasWhenType = whenType !== undefined
    const hasWhen = when !== undefined
    if (hasWhenType && !hasWhen) {
      return NextResponse.json(
        { error: 'when required when whenType is specified' },
        { status: 400 }
      )
    }
    if (!hasWhenType && hasWhen) {
      return NextResponse.json(
        { error: 'whenType required when when is specified' },
        { status: 400 }
      )
    }

    // whenType バリデーション（空欄許容）
    if (hasWhenType) {
      if (![0, 1, 2].includes(whenType)) {
        return NextResponse.json({ error: 'invalid whenType' }, { status: 400 })
      }
      if (when && typeof when === 'string' && when.trim() !== '') {
        const whenError = validateWhen(whenType, when)
        if (whenError) {
          return NextResponse.json({ error: whenError }, { status: 400 })
        }
      }
    }

    // placeId 存在チェック（null 以外が指定された場合）
    if (placeId !== undefined && placeId !== null) {
      const place = await prisma.place.findUnique({ where: { id: placeId } })
      if (!place) {
        return NextResponse.json({ error: 'place not found' }, { status: 400 })
      }
    }

    // 更新データを構築（undefined は変更しない）
    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name.trim()
    if (description !== undefined) data.description = description
    if (hasWhenType) {
      data.whenType = whenType
      data.when = when
    }
    if (placeId !== undefined) data.placeId = placeId

    const activityTemplate = await prisma.activityTemplate.update({
      where: { id: templateId },
      data,
      include: { place: true },
    })

    const duration = Date.now() - start
    console.log(`[activity-templates/${id}] PUT completed in ${duration}ms`)

    return NextResponse.json({ activityTemplate })
  } catch (e) {
    console.error(`/api/activity-templates/${id} PUT error`, e)
    const duration = Date.now() - start
    console.log(`[activity-templates/${id}] PUT failed in ${duration}ms`)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const start = Date.now()
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const templateId = parseInt(id)
    if (isNaN(templateId)) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    }

    const existing = await prisma.activityTemplate.findUnique({ where: { id: templateId } })
    if (!existing) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    await prisma.activityTemplate.delete({ where: { id: templateId } })

    const duration = Date.now() - start
    console.log(`[activity-templates/${id}] DELETE completed in ${duration}ms`)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(`/api/activity-templates/${id} DELETE error`, e)
    const duration = Date.now() - start
    console.log(`[activity-templates/${id}] DELETE failed in ${duration}ms`)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
