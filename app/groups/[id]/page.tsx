import { getGroupDetail } from '../../../lib/group';
import { requireAuth } from '../../../lib/auth';
import GroupMembersTab from './GroupMembersTab';
import GroupActivitiesTab from './GroupActivitiesTab';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';
import InviteModalWrapper from './InviteModalWrapper';
// Tabs, TabはUIコンポーネントとして別途実装してください。

interface GroupUser {
  userId: number;
  role: number;
}

interface Group {
  id: number;
  name: string;
  description: string;
  // ...existing code...
  groupUsers: GroupUser[];
  owner?: { name: string };
}




// Next.js App Router の page コンポーネント（async function）として正しく定義
export default async function GroupDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ invited?: string }> }) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const invited = resolvedSearchParams.invited === 'true';
  const groupId = Number(id);
  const user = await requireAuth();
  const group = await getGroupDetail(groupId);

  // デバッグ用ログ
  // console.log('[GroupDetailPage] user:', user);
  // console.log('[GroupDetailPage] group:', group);
  // console.log('[GroupDetailPage] groupUsers:', group.groupUsers);
  const myUserId = Number(user?.user?.id);
  // console.log('[GroupDetailPage] myUserId:', myUserId);

  if (!group) {
    notFound();
  }

  // 権限判定（role:3=OWNER, 2=ADMIN, 1=MEMBER, 0=GUEST）
  const myRole = group.groupUsers.find((u: GroupUser) => u.userId === myUserId)?.role;
  const isOwner = myRole === 3;
  const isAdmin = myRole === 2;

  // 参加権限がない場合でも一時的に非公開表示を無効化
  // if (myRole === undefined) {
  //   return (
  //     <Layout session={user} headerTitle="グループ詳細">
  //       <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
  //         <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">このグループは非公開です</h2>
  //         <Link href="/groups" className="text-blue-600 dark:text-blue-400 hover:underline">グループ一覧に戻る</Link>
  //       </div>
  //     </Layout>
  //   );
  // }

  return (
    <Layout session={user} headerTitle={`グループ詳細 - ${group.name}`}>
      {invited && (
        <div className="mb-4 px-4 py-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
          招待メールを送信しました
        </div>
      )}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{group.name}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">{group.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded">メンバー数: {group.groupUsers.length}</span>
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">オーナー: {group.owner?.name}</span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">自分のロール: {myRole ?? '未参加'}</span>
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            {(isOwner || isAdmin) && (
              <Link href={`/groups/${groupId}/edit`} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">編集</Link>
            )}
            {(isOwner || isAdmin) && (
              <InviteModalWrapper groupId={groupId} />
            )}
            {isOwner && (
              <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">削除</button>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="mb-4">
          <nav className="flex gap-4 border-b pb-2">
            <button className="px-3 py-1 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 font-semibold">メンバー一覧</button>
            <button className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">活動一覧</button>
          </nav>
        </div>
        <div>
          <Suspense fallback={<div>Loading...</div>}>
            <GroupMembersTab groupId={groupId} />
          </Suspense>
        </div>
        {/* 活動一覧タブはUI拡張時に切り替え実装 */}
      </div>
    </Layout>
  );
}

// Tabs, TabはUIコンポーネントとして別途実装してください。
