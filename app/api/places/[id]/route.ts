import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const start = Date.now()
  try {
    const placeId = parseInt(id)
    if (isNaN(placeId)) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    }

    const place = await prisma.place.findUnique({
      where: { id: placeId },
    })

    if (!place) {
      return NextResponse.json({ error: 'place not found' }, { status: 404 })
    }

    const duration = Date.now() - start
    console.log(`[places/${id}] GET completed in ${duration}ms`)
    return NextResponse.json({ place })
  } catch (e) {
    console.error(`/api/places/${id} GET error`, e)
    const duration = Date.now() - start
    console.log(`[places/${id}] GET failed in ${duration}ms`)
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
    const placeId = parseInt(id)
    if (isNaN(placeId)) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    }

    const body = await request.json()
    const { name, latitude, longitude } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }

    // 緯度のバリデーション（-90〜90）
    if (latitude !== null && latitude !== undefined) {
      const lat = parseFloat(latitude)
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return NextResponse.json(
          { error: 'latitude must be between -90 and 90' },
          { status: 400 }
        )
      }
    }

    // 経度のバリデーション（-180〜180）
    if (longitude !== null && longitude !== undefined) {
      const lng = parseFloat(longitude)
      if (isNaN(lng) || lng < -180 || lng > 180) {
        return NextResponse.json(
          { error: 'longitude must be between -180 and 180' },
          { status: 400 }
        )
      }
    }

    const place = await prisma.place.update({
      where: { id: placeId },
      data: {
        name,
        latitude: latitude !== null && latitude !== undefined ? parseFloat(latitude) : null,
        longitude: longitude !== null && longitude !== undefined ? parseFloat(longitude) : null,
      },
    })

    const duration = Date.now() - start
    console.log(`[places/${id}] PUT completed in ${duration}ms`)
    return NextResponse.json({ place })
  } catch (e) {
    console.error(`/api/places/${id} PUT error`, e)
    const duration = Date.now() - start
    console.log(`[places/${id}] PUT failed in ${duration}ms`)
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
    const placeId = parseInt(id)
    if (isNaN(placeId)) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    }

    await prisma.place.delete({
      where: { id: placeId },
    })

    const duration = Date.now() - start
    console.log(`[places/${id}] DELETE completed in ${duration}ms`)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(`/api/places/${id} DELETE error`, e)
    const duration = Date.now() - start
    console.log(`[places/${id}] DELETE failed in ${duration}ms`)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
