import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

// POST /api/groups/invite/accept { token: string }
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ error: 'token required' }, { status: 400 });
    }
    // トークン検証
    const invite = await prisma.verificationToken.findUnique({ where: { token } });
    if (!invite || !invite.groupId || invite.expires < new Date()) {
      return NextResponse.json({ error: 'invalid or expired token' }, { status: 400 });
    }
    // ユーザー特定
    const user = await prisma.user.findFirst({ where: { email: invite.identifier } });
    if (!user) {
      return NextResponse.json({ error: 'user not found' }, { status: 404 });
    }
    // 既に参加済みかチェック
    const already = await prisma.groupUser.findFirst({ where: { groupId: invite.groupId, userId: user.id } });
    if (already) {
      // トークンは消費
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ error: 'already joined' }, { status: 409 });
    }
    // 参加処理
    await prisma.groupUser.create({
      data: {
        groupId: invite.groupId,
        userId: user.id,
        role: 0, // デフォルトロール
      },
    });
    // トークン消費
    await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.json({ ok: true, groupId: invite.groupId });
  } catch (e) {
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
