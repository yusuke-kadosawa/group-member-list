import { getGroupDetail } from '../../../lib/group';
import { requireAuth } from '../../../lib/auth';
import GroupMembersTab from './GroupMembersTab';
import GroupActivitiesTab from './GroupActivitiesTab';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

// ダミーTabs/Tabコンポーネント（本番はUIライブラリ等で置換）
function Tabs({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
function Tab({ label, children }: { label: string; children: React.ReactNode }) {
  return <section><h2>{label}</h2>{children}</section>;
}

interface GroupUser {
  userId: number;
  role: string;
}

interface Group {
  id: number;
  name: string;
  description: string;
  type: string;
  joinType: string;
  groupUsers: GroupUser[];
  owner?: { name: string };
}

interface Props {
  params: { id: string };
}

export default async function GroupDetailPage({ params }: Props) {
  const groupId = Number(params.id);
  const user = await requireAuth();
  const group = await getGroupDetail(groupId);

  if (!group) {
    notFound();
  }

  // 権限判定
  const myRole = group.groupUsers.find((u: GroupUser) => u.userId === user?.id)?.role;
  const isOwner = myRole === 'OWNER';
  const isAdmin = myRole === 'ADMIN';
  const isPublic = group.type === 'PUBLIC';

  if (!isPublic && !myRole) {
    return (
      <div className="error">
        <h2>このグループは非公開です</h2>
        <a href="/groups">グループ一覧に戻る</a>
      </div>
    );
  }

  return (
    <main>
      <h1>{group.name}</h1>
      <p>{group.description}</p>
      <div>
        <span>タイプ: {group.type === 'PUBLIC' ? '公開' : '非公開'}</span>
        <span>参加方法: {group.joinType === 'FREE' ? '自由参加' : '承認制'}</span>
        <span>メンバー数: {group.groupUsers.length}</span>
        <span>オーナー: {group.owner?.name}</span>
        <span>自分のロール: {myRole ?? '未参加'}</span>
      </div>
      <div>
        {(isOwner || isAdmin) && <button>編集</button>}
        {isOwner && <button>削除</button>}
        {!myRole && isPublic && group.joinType === 'FREE' && <button>グループに参加</button>}
        {!myRole && isPublic && group.joinType === 'APPROVAL' && <button>参加リクエストを送信</button>}
      </div>
      <hr />
      <Tabs>
        <Tab label="メンバー一覧">
          <Suspense fallback={<div>Loading...</div>}>
            <GroupMembersTab groupId={groupId} />
          </Suspense>
        </Tab>
        <Tab label="活動一覧">
          <Suspense fallback={<div>Loading...</div>}>
            <GroupActivitiesTab groupId={groupId} />
          </Suspense>
        </Tab>
      </Tabs>
    </main>
  );
}

// Tabs, TabはUIコンポーネントとして別途実装してください。
