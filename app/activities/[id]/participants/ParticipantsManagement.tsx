'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: number
  name: string
  email: string
}

interface Participant {
  id: number
  user: {
    id: number
    name: string
    email: string
  }
  status: 'pending' | 'confirmed' | 'declined' | 'attended'
  joinedAt: string
}

interface Activity {
  id: number
  name: string
  groups: { id: number; name: string }[]
}

export default function ParticipantsManagement() {
  const params = useParams()
  const router = useRouter()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchActivity()
      fetchParticipants()
    }
  }, [params.id])

  const fetchActivity = async () => {
    try {
      const response = await fetch(`/api/activities/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setActivity(data.activity)
      }
    } catch (error) {
      console.error('Error fetching activity:', error)
    }
  }

  const fetchParticipants = async () => {
    try {
      const response = await fetch(`/api/activities/${params.id}/participants`)
      if (response.ok) {
        const data = await response.json()
        setParticipants(data.participants || [])
      } else {
        setError('参加者の取得に失敗しました')
      }
    } catch (error) {
      console.error('Error fetching participants:', error)
      setError('ネットワークエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        // 既に参加しているユーザーを除外
        const participantUserIds = participants.map(p => p.user.id)
        const available = (data.users || []).filter((user: User) => !participantUserIds.includes(user.id))
        setAvailableUsers(available)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleAddParticipant = async () => {
    if (!selectedUserId) return

    try {
      const response = await fetch(`/api/activities/${params.id}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: parseInt(selectedUserId) }),
      })

      if (response.ok) {
        setSelectedUserId('')
        setShowAddForm(false)
        fetchParticipants()
      } else {
        const error = await response.json()
        alert(`参加者の追加に失敗しました: ${error.error || '不明なエラー'}`)
      }
    } catch (error) {
      console.error('Error adding participant:', error)
      alert('ネットワークエラーが発生しました')
    }
  }

  const handleUpdateStatus = async (participantId: number, status: string) => {
    try {
      const response = await fetch(`/api/activities/${params.id}/participants/${participantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchParticipants()
      } else {
        const error = await response.json()
        alert(`ステータス更新に失敗しました: ${error.error || '不明なエラー'}`)
      }
    } catch (error) {
      console.error('Error updating participant status:', error)
      alert('ネットワークエラーが発生しました')
    }
  }

  const handleRemoveParticipant = async (participantId: number) => {
    if (!confirm('この参加者を削除しますか？')) {
      return
    }

    try {
      const response = await fetch(`/api/activities/${params.id}/participants/${participantId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchParticipants()
      } else {
        const error = await response.json()
        alert(`参加者の削除に失敗しました: ${error.error || '不明なエラー'}`)
      }
    } catch (error) {
      console.error('Error removing participant:', error)
      alert('ネットワークエラーが発生しました')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: '保留中', className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: '参加確定', className: 'bg-green-100 text-green-800' },
      declined: { label: '不参加', className: 'bg-red-100 text-red-800' },
      attended: { label: '参加済み', className: 'bg-blue-100 text-blue-800' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (error || !activity) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || '活動が見つかりません'}</p>
        <Link
          href={`/activities/${params.id}`}
          className="text-blue-500 hover:text-blue-600 underline"
        >
          活動詳細に戻る
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{activity.name} - 参加者管理</h1>
              <p className="text-sm text-gray-600 mt-1">
                対象グループ: {activity.groups.map(g => g.name).join(', ')}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/activities/${activity.id}`}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
              >
                活動詳細
              </Link>
              <Link
                href="/activities"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
              >
                活動一覧
              </Link>
            </div>
          </div>
        </div>

        {/* 参加者リスト */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              参加者一覧 ({participants.length}人)
            </h2>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm)
                if (!showAddForm) {
                  fetchAvailableUsers()
                }
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
            >
              {showAddForm ? 'キャンセル' : '参加者を追加'}
            </button>
          </div>

          {/* 参加者追加フォーム */}
          {showAddForm && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label htmlFor="userSelect" className="block text-sm font-medium text-gray-700 mb-1">
                    ユーザーを選択
                  </label>
                  <select
                    id="userSelect"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">ユーザーを選択してください</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddParticipant}
                  disabled={!selectedUserId}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  追加
                </button>
              </div>
            </div>
          )}

          <div className="px-6 py-4">
            {participants.length === 0 ? (
              <p className="text-gray-500 text-center py-8">参加者がいません</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        名前
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        メールアドレス
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        参加状況
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        参加日時
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participants.map((participant) => (
                      <tr key={participant.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {participant.user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {participant.user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={participant.status}
                            onChange={(e) => handleUpdateStatus(participant.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="pending">保留中</option>
                            <option value="confirmed">参加確定</option>
                            <option value="declined">不参加</option>
                            <option value="attended">参加済み</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(participant.joinedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleRemoveParticipant(participant.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            削除
                          </button>
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
  )
}
