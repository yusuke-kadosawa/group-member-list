import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import PlaceForm from "@/app/components/PlaceForm"

export default async function EditPlacePage({
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
              <Link href={`/places/${place.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                ← 場所詳細
              </Link>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                場所編集
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
            <PlaceForm mode="edit" initialData={place} />
          </div>
        </div>
      </main>
    </div>
  )
}
