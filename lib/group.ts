// グループ詳細取得APIラッパー（ダミー実装）
import { prisma } from './prisma';


export interface GroupUser {
  userId: number;
  role: number;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  // ...existing code...
  groupUsers: GroupUser[];
  owner?: { name: string };
}

export async function getGroupDetail(id: number): Promise<Group> {
  const isServer = typeof window === 'undefined';
  const baseUrl = isServer
    ? process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    : '';
  const res = await fetch(`${baseUrl}/api/groups/${id}`);
  if (!res.ok) throw new Error('グループ情報の取得に失敗しました');
  const data = await res.json();
  const group = data.group;
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    groupUsers: group.groupUsers ?? [],
    owner: group.owner ?? { name: '' },
  };
}
