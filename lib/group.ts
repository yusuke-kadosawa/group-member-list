// グループ詳細取得APIラッパー（ダミー実装）
import { prisma } from './prisma';

export interface GroupUser {
  userId: number;
  role: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  type: string;
  joinType: string;
  groupUsers: GroupUser[];
  owner?: { name: string };
}

export async function getGroupDetail(id: number): Promise<Group> {
  // 本来はDBから取得するが、まずはダミーデータ返却
  return {
    id,
    name: 'サンプルグループ',
    description: '説明サンプル',
    type: 'PUBLIC',
    joinType: 'FREE',
    groupUsers: [
      { userId: 1, role: 'OWNER' },
      { userId: 2, role: 'MEMBER' }
    ],
    owner: { name: 'オーナー名' },
  };
}
