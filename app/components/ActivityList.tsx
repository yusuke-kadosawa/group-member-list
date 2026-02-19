'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Activity {
  id: number
  name: string
  description: string | null
  startedAt: string
  finishedAt: string | null
  placeId: number | null
  place: {
    id: number
    name: string
    latitude: number | null
    longitude: number | null
  } | null
  groups: Array<{
    id: number
    name: string
  }>
  participants: Array<{
    id: number
    name: string | null
    email: string | null
    status: number
  }>
}

export default function ActivityList() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'finished'>('all')
  const router = useRouter()

  useEffect(() => {
    fetchActivities()
  }, [filter])

  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.set('status', filter)
      }

      const response = await fetch(`/api/activities?${params}`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
      } else {
        console.error('Failed to fetch activities')
      }
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (activity: Activity) => {
    const now = new Date()
    const start = new Date(activity.startedAt)
    const end = activity.finishedAt ? new Date(activity.finishedAt) : null

    if (end && now > end) {
      return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">終了</span>
    } else if (now >= start) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">進行中</span>
    } else {
      return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">予定</span>
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="text-center py-12">読み込み中...</div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">活動一覧</h2>
            <Link
              href="/activities/new"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              新規活動作成
            </Link>
          </div>

          {/* フィルター */}
          <div className="mb-6">
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'すべて' },
                { key: 'upcoming', label: '予定' },
                { key: 'ongoing', label: '進行中' },
                { key: 'finished', label: '終了' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filter === key
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 活動一覧 */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">活動がありません</p>
                <Link
                  href="/activities/new"
                  className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  最初の活動を作成
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {activities.map((activity) => (
                  <li key={activity.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            <Link
                              href={`/activities/${activity.id}`}
                              className="hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {activity.name}
                            </Link>
                          </h3>
                          {getStatusBadge(activity)}
                        </div>

                        {activity.description && (
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                        )}

                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>開始: {formatDateTime(activity.startedAt)}</span>
                          {activity.finishedAt && (
                            <span>終了: {formatDateTime(activity.finishedAt)}</span>
                          )}
                          {activity.place && (
                            <span>場所: {activity.place.name}</span>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-4 text-sm">
                          {activity.groups.length > 0 && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">対象グループ:</span>
                              <span className="ml-1 text-gray-900 dark:text-white">
                                {activity.groups.map(g => g.name).join(', ')}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">参加者:</span>
                            <span className="ml-1 text-gray-900 dark:text-white">{activity.participants.length}人</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/activities/${activity.id}`}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          詳細
                        </Link>
                        <Link
                          href={`/activities/${activity.id}/participants`}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                        >
                          参加者管理
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
