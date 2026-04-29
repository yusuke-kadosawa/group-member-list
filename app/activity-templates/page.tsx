export const dynamic = "force-dynamic"
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
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

export default async function ActivityTemplatesPage() {
  const session = await requireAuth()

  const activityTemplates = await prisma.activityTemplate.findMany({
    include: { place: true },
    orderBy: { id: 'asc' },
  })

  return (
    <Layout session={session} headerTitle="活動テンプレート管理">
      <div className="flex justify-end mb-6">
        <Link
          href="/activity-templates/new"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          新規テンプレート作成
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        {activityTemplates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              まだテンプレートが登録されていません
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {['テンプレート名', '時間タイプ', '時間値', '場所', '操作'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {activityTemplates.map((t) => (
                <tr key={t.id}>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{t.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {WHEN_TYPE_LABEL[t.whenType] ?? '不明'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatWhen(t.whenType, t.when ?? '')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {t.place?.name ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      href={`/activity-templates/${t.id}`}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}
