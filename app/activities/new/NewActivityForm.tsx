'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Group {
  id: number
  name: string
  description: string | null
}

interface Place {
  id: number
  name: string
  latitude: number | null
  longitude: number | null
}

export default function NewActivityForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startedAt: '',
    finishedAt: '',
    placeId: '',
    groupIds: [] as number[]
  })
  const [groups, setGroups] = useState<Group[]>([])
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchGroups()
    fetchPlaces()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups')
      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups || [])
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }

  const fetchPlaces = async () => {
    try {
      const response = await fetch('/api/places')
      if (response.ok) {
        const data = await response.json()
        setPlaces(data.places || [])
      }
    } catch (error) {
      console.error('Error fetching places:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const submitData = {
        ...formData,
        placeId: formData.placeId ? parseInt(formData.placeId) : null,
        groupIds: formData.groupIds
      }

      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        router.push('/activities')
      } else {
        const error = await response.json()
        alert(`作成に失敗しました: ${error.error || '不明なエラー'}`)
      }
    } catch (error) {
      console.error('Error creating activity:', error)
      alert('ネットワークエラーが発生しました')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGroupChange = (groupId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      groupIds: checked
        ? [...prev.groupIds, groupId]
        : prev.groupIds.filter(id => id !== groupId)
    }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 活動名 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                活動名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="活動名を入力"
              />
            </div>

            {/* 説明 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                説明
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="活動の詳細説明"
              />
            </div>

            {/* 開始日時 */}
            <div>
              <label htmlFor="startedAt" className="block text-sm font-medium text-gray-700">
                開始日時 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="startedAt"
                required
                value={formData.startedAt}
                onChange={(e) => setFormData(prev => ({ ...prev, startedAt: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 終了日時 */}
            <div>
              <label htmlFor="finishedAt" className="block text-sm font-medium text-gray-700">
                終了日時
              </label>
              <input
                type="datetime-local"
                id="finishedAt"
                value={formData.finishedAt}
                onChange={(e) => setFormData(prev => ({ ...prev, finishedAt: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 場所 */}
            <div>
              <label htmlFor="placeId" className="block text-sm font-medium text-gray-700">
                場所
              </label>
              <select
                id="placeId"
                value={formData.placeId}
                onChange={(e) => setFormData(prev => ({ ...prev, placeId: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">場所を選択</option>
                {places.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 対象グループ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                対象グループ
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                {groups.map((group) => (
                  <label key={group.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.groupIds.includes(group.id)}
                      onChange={(e) => handleGroupChange(group.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{group.name}</span>
                  </label>
                ))}
                {groups.length === 0 && (
                  <p className="text-sm text-gray-500">グループがありません</p>
                )}
              </div>
            </div>

            {/* ボタン */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '作成中...' : '作成'}
              </button>
            </div>
          </form>
        </div>
      </div>
  )
}
