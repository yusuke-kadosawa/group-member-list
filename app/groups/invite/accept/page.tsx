import { redirect } from 'next/navigation';
import { prisma } from '@/prisma';

export default async function GroupInviteAcceptPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token) {
    return <div>招待トークンが見つかりません。</div>;
  }

  // トークン検証・取得
  const invite = await prisma.verificationToken.findUnique({ where: { token } });
  if (!invite || !invite.groupId || invite.expires < new Date()) {
    return <div>この招待リンクは無効または期限切れです。</div>;
  }

  // グループ名取得
  const group = await prisma.group.findUnique({ where: { id: invite.groupId } });
  const groupName = group?.name || 'グループ';

  // ホームへリダイレクトし、メッセージをクエリで渡す
  redirect(`/?joinedGroup=${encodeURIComponent(groupName)}`);

  return null;
}
