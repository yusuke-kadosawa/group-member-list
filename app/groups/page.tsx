import { auth } from "@/app/auth"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import GroupList from "@/app/components/GroupList"
import Layout from "../components/Layout"

export default async function GroupsPage() {
  let session: any = undefined
  if (typeof auth === 'function') {
    session = await auth()
  }

  // フォールバック: auth() がセッションを返さない場合、cookie を直接参照
  if (!session) {
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get("next-auth.session-token")?.value
      if (token) {
        const dbSession = await prisma.session.findUnique({
          where: { sessionToken: token },
          include: { user: true },
        })
        if (dbSession && dbSession.expires > new Date()) {
          session = { user: { id: dbSession.user.id, name: dbSession.user.name, email: dbSession.user.email } }
        }
      }
    } catch (e) {
      console.error('session fallback error', e)
    }
  }

  if (!session) {
    redirect("/auth/signin")
  }

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

  return (
    <Layout session={session}>
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
        <header className="bg-white dark:bg-gray-900 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-4">
                <Link
                  href="/home"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  ← ホーム
                </Link>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  グループ一覧
                </h1>
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                {session.user?.email}
              </span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <GroupList groups={groupsWithMembers} initialViewMode={viewMode} />
          </div>
        </main>
      </div>
    </Layout>
  )
}
