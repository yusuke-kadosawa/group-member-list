export const dynamic = "force-dynamic"
import { requireAuth } from "@/lib/auth"
import Link from "next/link"
import Layout from "../components/Layout"
import ActivityList from "../components/ActivityList"

export default async function ActivitiesPage() {
  const session = await requireAuth()

  return (
    <Layout
      session={session}
      headerTitle="活動管理"
    >
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-2 justify-end">
          <Link
            href="/activities/calendar/day/2026/5/8"
            className="px-3 py-1 rounded font-bold bg-white text-blue-700 border border-blue-600 shadow-sm hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors"
            aria-label="日カレンダー表示"
          >
            日
          </Link>
          <Link
            href="/activities/calendar/week/2026/19"
            className="px-3 py-1 rounded font-bold bg-white text-green-700 border border-green-600 shadow-sm hover:bg-green-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-colors"
            aria-label="週カレンダー表示"
          >
            週
          </Link>
          <Link
            href="/activities/calendar/month/2026/5"
            className="px-3 py-1 rounded font-bold bg-white text-purple-700 border border-purple-600 shadow-sm hover:bg-purple-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transition-colors"
            aria-label="月カレンダー表示"
          >
            月
          </Link>
        </div>
        <div className="flex justify-end">
          <Link
            href="/activities/new"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            新規作成
          </Link>
        </div>
      </div>
      <ActivityList />
    </Layout>
  )
}
