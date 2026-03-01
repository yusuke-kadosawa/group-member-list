import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const start = Date.now()
  try {
    const groupId = parseInt(id)
    if (isNaN(groupId)) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    }

    // グループ詳細＋メンバー・オーナー情報を含めて返却
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        groupUsers: {
          select: {
            userId: true,
            role: true,
            user: { select: { name: true } },
          },
        },
      },
    })

    if (!group) {
      return NextResponse.json({ error: 'group not found' }, { status: 404 })
    }

    // オーナー情報抽出（role:3）
    const ownerUser = group.groupUsers.find((u: any) => u.role === 3)
    const owner = ownerUser ? { name: ownerUser.user?.name ?? '' } : { name: '' }

    // groupUsers配列をAPIレスポンス用に整形
    const groupUsers = group.groupUsers.map((u: any) => ({
      userId: u.userId,
      role: u.role,
      name: u.user?.name ?? '',
    }))

    const duration = Date.now() - start
    console.log(`[groups/${id}] GET completed in ${duration}ms`)
    return NextResponse.json({
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        groupUsers,
        owner,
      }
    })
  } catch (e) {
    console.error(`/api/groups/${id} GET error`, e)
    const duration = Date.now() - start
    console.log(`[groups/${id}] GET failed in ${duration}ms`)
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
    const groupId = parseInt(id)
    if (isNaN(groupId)) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }

    const group = await prisma.group.update({
      where: { id: groupId },
      data: {
        name,
        description: description || null,
      },
    })

    const duration = Date.now() - start
    console.log(`[groups/${id}] PUT completed in ${duration}ms`)
    return NextResponse.json({ group })
  } catch (e) {
    console.error(`/api/groups/${id} PUT error`, e)
    const duration = Date.now() - start
    console.log(`[groups/${id}] PUT failed in ${duration}ms`)
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
    const groupId = parseInt(id)
    if (isNaN(groupId)) {
      return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    }

    await prisma.group.delete({
      where: { id: groupId },
    })

    const duration = Date.now() - start
    console.log(`[groups/${id}] DELETE completed in ${duration}ms`)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(`/api/groups/${id} DELETE error`, e)
    const duration = Date.now() - start
    console.log(`[groups/${id}] DELETE failed in ${duration}ms`)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
