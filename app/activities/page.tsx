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
      <div className="flex justify-end mb-6">
        <Link
          href="/activities/new"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          新規作成
        </Link>
      </div>
      <ActivityList />
    </Layout>
  )
}
