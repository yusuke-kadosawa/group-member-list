import { requireAuth } from "@/lib/auth"
import Link from "next/link"
import PlaceForm from "@/app/components/PlaceForm"
import Layout from "@/app/components/Layout"

export default async function NewPlacePage() {
  const session = await requireAuth()

  return (
    <Layout session={session} headerTitle="新規場所作成">
      <div className="mb-4">
        <Link href="/places" className="text-blue-600 dark:text-blue-400 hover:underline">
          ← 場所一覧
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <PlaceForm mode="create" />
      </div>
    </Layout>
  )
}
