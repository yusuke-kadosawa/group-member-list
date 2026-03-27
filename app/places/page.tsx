import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import PlaceList from "@/app/components/PlaceList"
import PlacesMap from "@/app/components/PlacesMap"
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
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2 rounded-lg overflow-hidden shadow flex-shrink-0">
          <PlacesMap places={places} />
        </div>
        <div className="md:w-1/2 min-w-0">
          <PlaceList places={places} />
        </div>
      </div>
    </Layout>
  )
}
