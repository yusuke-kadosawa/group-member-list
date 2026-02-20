import { requireAuth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Layout from "../../components/Layout"
import Link from "next/link"

interface PageProps {
  params: Promise<{ id: string }>
}

const getParticipantStatusBadge = (status: number) => {
  const statusConfig: Record<number, { label: string; className: string }> = {
    0: { label: '保留中', className: 'bg-yellow-100 text-yellow-800' },
    1: { label: '参加確定', className: 'bg-green-100 text-green-800' },
    2: { label: '不参加', className: 'bg-red-100 text-red-800' },
    3: { label: '参加済み', className: 'bg-blue-100 text-blue-800' }
  }
  const config = statusConfig[status] || statusConfig[0]
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
      {config.label}
    </span>
  )
}

const formatDateTime = (date: Date) => {
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const session = await requireAuth()

  const { id } = await params
  const activityId = parseInt(id, 10)

  if (isNaN(activityId)) {
    notFound()
  }

  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      place: true,
      groups: {
        include: {
          group: true
        }
      },
      users: {
        include: {
          user: true
        }
      }
    }
  })

  if (!activity) {
    notFound()
  }

  return (
    <Layout session={session} headerTitle={activity.name}>
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{activity.name}</h2>
              <div className="mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  作成日: {formatDateTime(activity.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/activities/${activity.id}/edit`}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                編集
              </Link>
              <Link
                href="/activities"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                一覧に戻る
              </Link>
            </div>
          </div>

          {/* 活動詳細 */}
          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">開始日時</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatDateTime(activity.startedAt)}
                </dd>
              </div>
              {activity.finishedAt && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">終了日時</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {formatDateTime(activity.finishedAt)}
                  </dd>
                </div>
              )}
              {activity.place && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">場所</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{activity.place.name}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">対象グループ</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {activity.groups.length > 0
                    ? activity.groups.map(g => g.group.name).join(', ')
                    : 'なし'
                  }
                </dd>
              </div>
            </dl>

            {activity.description && (
              <div className="mt-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">説明</dt>
                <dd className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {activity.description}
                </dd>
              </div>
            )}
          </div>
        </div>

        {/* 参加者リスト */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            参加者 ({activity.users.length}人)
          </h3>
          <Link
            href={`/activities/${activity.id}/participants`}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
          >
            参加者管理
          </Link>
        </div>

        <div className="px-6 py-4">
          {activity.users.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">参加者がいません</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      名前
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      メールアドレス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      参加状況
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      参加日時
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {activity.users.map((activityUser) => (
                    <tr key={activityUser.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {activityUser.user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {activityUser.user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getParticipantStatusBadge(activityUser.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDateTime(activityUser.joinedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  </Layout>
  )
}
