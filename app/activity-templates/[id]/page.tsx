import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Layout from '@/app/components/Layout'

const WHEN_TYPE_LABEL = ['日付', '曜日', '時刻'] as const

const WEEK_DAYS = ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜']

function formatWhen(whenType: number, when: string): string {
  if (whenType === 1) {
    const idx = parseInt(when)
    return isNaN(idx) ? when : (WEEK_DAYS[idx] ?? when)
  }
  return when
}

export default async function ActivityTemplateDetailPage({
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
    include: { place: true },
  })

  if (!activityTemplate) {
    notFound()
  }

  return (
    <Layout session={session} headerTitle="テンプレート詳細">
      <div className="mb-4">
        <Link
          href="/activity-templates"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← テンプレート一覧
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow max-w-2xl mx-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {activityTemplate.name}
            </h2>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">説明</h3>
            <p className="mt-1 text-gray-900 dark:text-white">
              {activityTemplate.description ?? '—'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">時間タイプ</h3>
            <p className="mt-1 text-gray-900 dark:text-white">
              {WHEN_TYPE_LABEL[activityTemplate.whenType] ?? '不明'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">時間値</h3>
            <p className="mt-1 text-gray-900 dark:text-white">
              {formatWhen(activityTemplate.whenType, activityTemplate.when ?? '')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">場所</h3>
            <p className="mt-1 text-gray-900 dark:text-white">
              {activityTemplate.place?.name ?? '—'}
            </p>
          </div>

          <div className="pt-4">
            <Link
              href={`/activity-templates/${activityTemplate.id}/edit`}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              編集
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
