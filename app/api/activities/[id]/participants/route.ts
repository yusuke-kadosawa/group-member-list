import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import authOptions from '@/app/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const activityId = parseInt(id)
    if (isNaN(activityId)) {
      return NextResponse.json({ error: 'Invalid activity ID' }, { status: 400 })
    }

    const participants = await prisma.activityUser.findMany({
      where: { activityId },
      include: {
        user: true
      }
    })

    const formattedParticipants = participants.map(p => ({
      userId: p.userId,
      name: p.user.name,
      email: p.user.email,
      status: p.status,
      joinedAt: p.joinedAt.toISOString()
    }))

    return NextResponse.json({ participants: formattedParticipants })
  } catch (error) {
    console.error('activities participants GET error', error)
    return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const activityId = parseInt(id)
    if (isNaN(activityId)) {
      return NextResponse.json({ error: 'Invalid activity ID' }, { status: 400 })
    }

    const body = await req.json()
    const { userId, status = 0 } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // 重複チェック
    const existing = await prisma.activityUser.findUnique({
      where: {
        activityId_userId: {
          activityId,
          userId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'User already participating' }, { status: 409 })
    }

    const participant = await prisma.activityUser.create({
      data: {
        activityId,
        userId,
        status
      }
    })

    return NextResponse.json({
      participant: {
        userId: participant.userId,
        status: participant.status,
        joinedAt: participant.joinedAt.toISOString()
      }
    }, { status: 201 })
  } catch (error) {
    console.error('activities participants POST error', error)
    return NextResponse.json({ error: 'Failed to add participant' }, { status: 500 })
  }
}