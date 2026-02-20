import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import PlaceList from "@/app/components/PlaceList"
import Layout from "../components/Layout"

export default async function PlacesPage() {
  const session = await requireAuth()

  const renderStart = Date.now()

  // 場所一覧を取得
  const places = await prisma.place.findMany({
    orderBy: {
      id: 'asc',
    },
  })

  const renderDur = Date.now() - renderStart
  console.log(`[places] render for ${session.user?.email || 'unknown'} completed in ${renderDur}ms`)

  return (
    <Layout
      session={session}
      headerTitle="場所管理"
    >
      <div className="flex justify-end mb-6">
        <Link
          href="/places/new"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          新規作成
        </Link>
      </div>
      <PlaceList places={places} />
    </Layout>
  )
}
