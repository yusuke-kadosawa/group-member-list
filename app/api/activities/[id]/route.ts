import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const activityId = parseInt(id)
    if (isNaN(activityId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
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
      }
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    const formattedActivity = {
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
      })),
      createdAt: activity.createdAt.toISOString(),
      updatedAt: activity.updatedAt.toISOString()
    }

    return NextResponse.json({ activity: formattedActivity })
  } catch (error) {
    console.error('activities GET error', error)
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const activityId = parseInt(id)
    if (isNaN(activityId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await req.json()
    const { name, description, startedAt, finishedAt, placeId, groupIds } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (startedAt !== undefined) updateData.startedAt = new Date(startedAt)
    if (finishedAt !== undefined) updateData.finishedAt = finishedAt ? new Date(finishedAt) : null
    if (placeId !== undefined) updateData.placeId = placeId

    const activity = await prisma.activity.update({
      where: { id: activityId },
      data: updateData
    })

    if (groupIds && Array.isArray(groupIds)) {
      // 既存の関連を削除
      await prisma.activityGroup.deleteMany({
        where: { activityId }
      })
      // 新しい関連を作成
      await prisma.activityGroup.createMany({
        data: groupIds.map((groupId: number) => ({
          activityId,
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
        updatedAt: activity.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('activities PUT error', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const activityId = parseInt(id)
    if (isNaN(activityId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    await prisma.activity.delete({
      where: { id: activityId }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('activities DELETE error', error)
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 })
  }
}
