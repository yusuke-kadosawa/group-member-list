import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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
    <Layout session={session} headerTitle="場所一覧">
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <PlaceList places={places} />
          </div>
        </main>
      </div>
    </Layout>
  )
}
