import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"

import Layout from "@/app/components/Layout"
import PlaceMapWrapper from "@/app/components/PlaceMapWrapper"

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
    <Layout session={session} headerTitle="場所詳細">
      <div className="mb-4">
        <Link href="/places" className="text-blue-600 dark:text-blue-400 hover:underline">
          ← 場所一覧
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow max-w-2xl mx-auto">
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

          {/* 地図表示: 緯度・経度が両方存在する場合のみ */}
          {place.latitude !== null && place.longitude !== null && (
            <div className="pt-2 w-full block clear-both">
              <PlaceMapWrapper latitude={place.latitude} longitude={place.longitude} placeName={place.name} />
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
    </Layout>
  )
}
