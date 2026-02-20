import { requireAuth } from "@/lib/auth"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import GroupList from "@/app/components/GroupList"
import Layout from "../components/Layout"

export default async function GroupsPage() {
  const session = await requireAuth()

  const renderStart = Date.now();

  // グループ一覧を取得
  const groups = await prisma.group.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })

  // 各グループのメンバー数を取得
  const groupIds = groups.map(g => g.id)
  const memberCounts = await prisma.groupUser.groupBy({
    by: ['groupId'],
    _count: {
      id: true,
    },
    where: {
      groupId: { in: groupIds },
    },
  })

  // メンバー数をマップに変換
  const memberCountMap = new Map(
    memberCounts.map(item => [item.groupId, item._count.id])
  )

  // グループにメンバー数を追加
  const groupsWithMembers = groups.map(group => ({
    ...group,
    memberCount: memberCountMap.get(group.id) || 0,
  }))

  // 表示モードをcookieから取得（デフォルトはカード）
  const cookieStore = await cookies()
  const viewMode = (cookieStore.get("groupViewMode")?.value as 'card' | 'list') || 'card'

  const renderDur = Date.now() - renderStart;
  console.log(`[groups] render for ${session.user?.email || 'unknown'} completed in ${renderDur}ms`);

  return (
    <Layout
      session={session}
      headerTitle="グループ管理"
    >
      <div className="flex justify-end mb-6">
        <Link
          href="/groups/new"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          新規作成
        </Link>
      </div>
      <GroupList groups={groupsWithMembers} initialViewMode={viewMode} />
    </Layout>
  )
}
