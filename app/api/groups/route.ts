import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/session'

export async function GET() {
  const start = Date.now()
  try {
    const groups = await prisma.group.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    const duration = Date.now() - start
    console.log(`[groups] GET completed in ${duration}ms`)

    return NextResponse.json({ groups })
  } catch (e) {
    console.error('/api/groups error', e)
    const duration = Date.now() - start
    console.log(`[groups] GET failed in ${duration}ms`)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const start = Date.now()
  try {
    // 認証ユーザー取得（APIルート用: 未認証時は401返却）
    const session = await getServerSession();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name required' }, { status: 400 });
    }

    // グループ作成時にgroupUsers（オーナー）を同時に作成
    const group = await prisma.group.create({
      data: {
        name,
        description: description || null,
        groupUsers: {
          create: [{ userId, role: 3 }],
        },
      },
      include: {
        groupUsers: true,
      },
    });

    const duration = Date.now() - start;
    console.log(`[groups] POST completed in ${duration}ms`);
    return NextResponse.json({ group });
  } catch (e) {
    console.error('/api/groups POST error', e);
    if (e && typeof e === 'object') {
      try {
        console.error('Error (JSON):', JSON.stringify(e));
      } catch {}
      if ('stack' in e) {
        console.error('Error stack:', e.stack);
      }
    }
    const duration = Date.now() - start;
    console.log(`[groups] POST failed in ${duration}ms`);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
