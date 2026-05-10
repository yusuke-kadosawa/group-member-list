import { requireAuth } from "@/lib/auth"
import { prisma } from "@/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import PlaceForm from "@/components/PlaceForm"
import Layout from "@/components/Layout"

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
    <Layout session={session} headerTitle="場所編集">
      <div className="mb-4">
        <Link href={`/places/${place.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
          ← 場所詳細
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <PlaceForm mode="edit" initialData={place} />
      </div>
    </Layout>
  )
}
