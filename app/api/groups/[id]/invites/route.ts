import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { prisma } from '@/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const groupId = parseInt(id)
  if (isNaN(groupId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const invites = await prisma.verificationToken.findMany({
    where: {
      groupId,
      expires: { gt: new Date() },
    },
    orderBy: { expires: 'asc' },
    select: {
      identifier: true,
      expires: true,
    },
  })

  return NextResponse.json({ invites })
}
