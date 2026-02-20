import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireAuth()
  const { id } = await params

  const placeId = parseInt(id)
  if (isNaN(placeId)) {
    notFound()
  }

  const place = await prisma.place.findUnique({
    where: { id: placeId },
  })

  if (!place) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <header className="bg-white dark:bg-gray-900 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/places" className="text-blue-600 dark:text-blue-400 hover:underline">
                ← 場所一覧
              </Link>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                場所詳細
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
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  場所名
                </h3>
                <p className="mt-1 text-lg text-gray-900 dark:text-white">
                  {place.name}
                </p>
              </div>

              {place.latitude !== null && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    緯度
                  </h3>
                  <p className="mt-1 text-lg text-gray-900 dark:text-white">
                    {place.latitude.toFixed(6)}
                  </p>
                </div>
              )}

              {place.longitude !== null && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    経度
                  </h3>
                  <p className="mt-1 text-lg text-gray-900 dark:text-white">
                    {place.longitude.toFixed(6)}
                  </p>
                </div>
              )}

              <div className="pt-4">
                <Link
                  href={`/places/${place.id}/edit`}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors inline-block"
                >
                  編集
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
