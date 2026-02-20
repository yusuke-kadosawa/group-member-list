import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import GroupForm from "@/app/components/GroupForm"
import Layout from "@/app/components/Layout"

export default async function NewGroupPage() {
  const session = await requireAuth()

  return (
    <Layout session={session} headerTitle="新規グループ作成">
      <div className="mb-4">
        <Link href="/groups" className="text-blue-600 dark:text-blue-400 hover:underline">
          ← グループ一覧
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <GroupForm mode="create" />
      </div>
    </Layout>
  )
}
