import { requireAuth } from '@/lib/auth'
import { prisma } from '@/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Layout from '@/components/Layout'
import ActivityTemplateForm from '@/components/ActivityTemplateForm'

export default async function EditActivityTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireAuth()
  const { id } = await params

  const templateId = parseInt(id)
  if (isNaN(templateId)) {
    notFound()
  }

  const activityTemplate = await prisma.activityTemplate.findUnique({
    where: { id: templateId },
  })

  if (!activityTemplate) {
    notFound()
  }

  // whenがnullの場合は空文字列に変換
  const initialData = {
    ...activityTemplate,
    when: activityTemplate.when ?? '',
  }

  return (
    <Layout session={session} headerTitle="テンプレート編集">
      <div className="mb-4">
        <Link
          href={`/activity-templates/${activityTemplate.id}`}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← テンプレート詳細
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <ActivityTemplateForm mode="edit" initialData={initialData} />
      </div>
    </Layout>
  )
}
