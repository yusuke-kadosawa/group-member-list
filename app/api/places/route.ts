import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const start = Date.now()
  try {
    const places = await prisma.place.findMany({
      orderBy: {
        id: 'asc',
      },
    })

    const duration = Date.now() - start
    console.log(`[places] GET completed in ${duration}ms`)

    return NextResponse.json({ places })
  } catch (e) {
    console.error('/api/places error', e)
    const duration = Date.now() - start
    console.log(`[places] GET failed in ${duration}ms`)
    let debug = {};
    if (e instanceof Error) {
      debug = {
        message: e.message,
        stack: e.stack,
        cause: e.cause,
      };
    } else {
      debug = { error: String(e) };
    }
    return NextResponse.json({ error: 'server error', debug }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const start = Date.now()
  try {
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

    const place = await prisma.place.create({
      data: {
        name,
        latitude: latitude !== null && latitude !== undefined ? parseFloat(latitude) : null,
        longitude: longitude !== null && longitude !== undefined ? parseFloat(longitude) : null,
      },
    })

    const duration = Date.now() - start
    console.log(`[places] POST completed in ${duration}ms`)

    return NextResponse.json({ place }, { status: 201 })
  } catch (e) {
    console.error('/api/places POST error', e)
    const duration = Date.now() - start
    console.log(`[places] POST failed in ${duration}ms`)
    let debug = {};
    if (e instanceof Error) {
      debug = {
        message: e.message,
        stack: e.stack,
        cause: e.cause,
      };
    } else {
      debug = { error: String(e) };
    }
    try {
      const body = await request.json();
      debug = { ...debug, body };
    } catch (err) {
      debug = { ...debug, bodyParseError: String(err) };
    }
    return NextResponse.json({ error: 'server error', debug }, { status: 500 })
  }
}
