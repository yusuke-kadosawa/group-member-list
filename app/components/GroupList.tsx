"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'

type Group = {
  id: number
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  memberCount: number
}

type ViewMode = 'card' | 'list'

type GroupListProps = {
  groups: Group[]
  initialViewMode: ViewMode
}

export default function GroupList({ groups, initialViewMode }: GroupListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)

  useEffect(() => {
    // cookieに保存
    document.cookie = `groupViewMode=${viewMode}; path=/; max-age=31536000` // 1年
  }, [viewMode])

  return (
    <div>
      {/* 表示切替ボタン */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/groups/new" className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
          + 新規グループ作成
        </Link>

        <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-md shadow p-1">
          <button
            onClick={() => setViewMode('card')}
            className={`px-4 py-2 rounded transition-colors ${
              viewMode === 'card'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* 空状態 */}
      {groups.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-600 dark:text-gray-400">
            まだグループがありません。<br />
            新規グループを作成してください。
          </p>
        </div>
      ) : viewMode === 'card' ? (
        // カード表示
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {group.name}
              </h3>
              <div className="mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  {group.memberCount} 人
                </span>
              </div>
              {group.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {group.description}
                </p>
              )}
              <div className="mb-3 space-y-1">
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  作成日時: {new Date(group.createdAt).toLocaleString('ja-JP')}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  更新日時: {new Date(group.updatedAt).toLocaleString('ja-JP')}
                </div>
              </div>
              <div className="flex items-center justify-end">
                <div className="flex gap-2">
                  <Link
                    href={`/groups/${group.id}/edit`}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    編集
                  </Link>
                  <span className="text-gray-400">|</span>
                  <Link
                    href={`/groups/${group.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    詳細
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // リスト表示
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  グループ名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  メンバー数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  説明
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  作成日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  更新日時
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/groups/${group.id}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      {group.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {group.memberCount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-1">
                      {group.description || '—'}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
                    {new Date(group.createdAt).toLocaleString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
                    {new Date(group.updatedAt).toLocaleString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      href={`/groups/${group.id}/edit`}
                      className="text-blue-600 dark:text-blue-400 hover:underline mr-4"
                    >
                      編集
                    </Link>
                    <Link
                      href={`/groups/${group.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
