import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/prisma'
import { sendGroupInviteMail } from '@/mailer'
import { randomUUID } from 'crypto'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('[invite API] POST called');
    const session = await requireAuth();
    console.log('[invite API] session:', session);
    const inviterId = session?.user?.id;
    const inviterName = session?.user?.name;
    if (!inviterId) {
      return NextResponse.json({ error: 'auth required' }, { status: 401 });
    }

    const body = await request.json();
    console.log('[invite API] request body:', body);
    const { groupId, emails, message } = body;
    if (!groupId || !emails || !Array.isArray(emails) || emails.length === 0) {
      console.log('[invite API] missing groupId or emails');
      return NextResponse.json({ error: 'groupId and emails required' }, { status: 400 });
    }

    // グループ存在確認
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      console.log('[invite API] group not found:', groupId);
      return NextResponse.json({ error: 'group not found' }, { status: 404 });
    }

    const results = [];
    console.log('[invite API] inviting emails:', emails);
    for (const email of emails) {
      try {
        // 既存メンバー・既招待済みチェック
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
          const isMember = await prisma.groupUser.findFirst({ where: { groupId, userId: existingUser.id } });
          if (isMember) {
            results.push({ email, status: 'already_member' });
            continue;
          }
        }
        const existingInvite = await prisma.verificationToken.findFirst({ where: { identifier: email, groupId, expires: { gt: new Date() } } });
        if (existingInvite) {
          results.push({ email, status: 'already_invited' });
          continue;
        }

        // 招待トークン発行
        const token = randomUUID();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        await prisma.verificationToken.create({
          data: {
            identifier: email,
            token,
            expires,
            groupId,
          },
        });

        // メール送信
        await sendGroupInviteMail({
          to: email,
          groupName: group.name,
          inviterName,
          inviteUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/groups/invite/accept?token=${token}`,
          message,
          expires,
        });
        results.push({ email, status: 'invited' });
        console.log('[invite API] invited:', email);
      } catch (e) {
        console.error('[invite API] error for', email, e);
        results.push({ email, status: 'error', error: (e as Error).message });
      }
    }
    console.log('[invite API] results:', results);
    return NextResponse.json({ ok: true, count: results.filter(r => r.status === 'invited').length, results });
  } catch (e) {
    console.error('[invite API] group invite error', e);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
