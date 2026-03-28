import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const { id, userId } = await params
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const activityId = parseInt(id)
    const userIdNum = parseInt(userId)

    if (isNaN(activityId) || isNaN(userIdNum)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const body = await req.json()
    const { status } = body

    if (status === undefined) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 })
    }

    const participant = await prisma.activityUser.update({
      where: {
        activityId_userId: {
          activityId,
          userId: userIdNum
        }
      },
      data: {
        status
      }
    })

    return NextResponse.json({
      participant: {
        userId: participant.userId,
        status: participant.status,
        updatedAt: participant.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('activities participants PUT error', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update participant' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const { id, userId } = await params
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const activityId = parseInt(id)
    const userIdNum = parseInt(userId)

    if (isNaN(activityId) || isNaN(userIdNum)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    await prisma.activityUser.delete({
      where: {
        activityId_userId: {
          activityId,
          userId: userIdNum
        }
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('activities participants DELETE error', error)
    return NextResponse.json({ error: 'Failed to remove participant' }, { status: 500 })
  }
}
