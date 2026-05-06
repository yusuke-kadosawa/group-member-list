import { NextRequest, NextResponse } from 'next/server'
import { getSessionWithLog } from '../_util/sessionLog'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionWithLog(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const groupId = searchParams.get('groupId')
    const status = searchParams.get('status')

    let where: any = {}

    if (groupId) {
      where.groups = {
        some: {
          groupId: parseInt(groupId)
        }
      }
    }

    if (status) {
      const now = new Date()
      switch (status) {
        case 'upcoming':
          where.startedAt = { gt: now }
          break
        case 'ongoing':
          where.startedAt = { lte: now }
          where.OR = [
            { finishedAt: null },
            { finishedAt: { gte: now } }
          ]
          break
        case 'finished':
          where.finishedAt = { lt: now }
          break
      }
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        place: true,
        groups: {
          include: {
            group: true
          }
        },
        users: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        startedAt: 'desc'
      }
    })

      const formattedActivities = activities.map(activity => ({
        id: activity.id,
        name: activity.name,
        description: activity.description,
        startedAt: activity.startedAt.toISOString(),
        finishedAt: activity.finishedAt?.toISOString() || null,
        placeId: activity.placeId,
        place: activity.place,
        groups: activity.groups.map(ag => ag.group),
        participants: activity.users.map(au => ({
          id: au.user.id,
          name: au.user.name,
          email: au.user.email,
          status: au.status
        }))
      }))

      return NextResponse.json({ activities: formattedActivities })
    } catch (error) {
      console.error('activities GET error', error)
      if (error instanceof Error) {
        console.error('stack:', error.stack)
        if (error.cause) console.error('cause:', error.cause)
      }
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
    }
  }

  export async function POST(req: NextRequest) {
    try {
      const session = await getSessionWithLog(req)
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const body = await req.json()
      const { name, description, startedAt, finishedAt, placeId, groupIds } = body

      if (!name || !startedAt) {
        return NextResponse.json({ error: 'name and startedAt are required' }, { status: 400 })
      }

      const activity = await prisma.activity.create({
        data: {
          name,
          description,
          startedAt: new Date(startedAt),
          finishedAt: finishedAt ? new Date(finishedAt) : null,
          placeId: placeId ?? null
        }
      })

      if (groupIds && Array.isArray(groupIds)) {
        await prisma.activityGroup.createMany({
          data: groupIds.map((groupId: number) => ({
            activityId: activity.id,
            groupId
          }))
        })
      }

      return NextResponse.json({
        activity: {
          id: activity.id,
          name: activity.name,
          description: activity.description,
          startedAt: activity.startedAt.toISOString(),
          finishedAt: activity.finishedAt?.toISOString() || null,
          placeId: activity.placeId,
          createdAt: activity.createdAt.toISOString(),
          updatedAt: activity.updatedAt.toISOString()
        }
      }, { status: 201 })
    } catch (error) {
      console.error('activities POST error', error)
      if (error instanceof Error) {
        console.error('stack:', error.stack)
        if (error.cause) console.error('cause:', error.cause)
      }
      // 追加: リクエストボディやセッション情報も出力
      try {
        const body = await req.json();
        console.error('POST body:', body);
      } catch (e) {
        console.error('POST body parse error:', e);
      }
      try {
        const session = await getSessionWithLog(req);
        console.error('POST session:', session);
      } catch (e) {
        console.error('POST session error:', e);
      }
      let debug = {};
      if (error instanceof Error) {
        debug = {
          message: error.message,
          stack: error.stack,
          cause: error.cause,
        };
      } else {
        debug = { error: String(error) };
      }
      try {
        const body = await req.json();
        debug = { ...debug, body };
      } catch (e) {
        debug = { ...debug, bodyParseError: String(e) };
      }
      try {
        const session = await getSessionWithLog(req);
        debug = { ...debug, session };
      } catch (e) {
        debug = { ...debug, sessionError: String(e) };
      }
      return NextResponse.json({ error: 'Failed to create activity', debug }, { status: 500 })
    }
}
