'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Place {
  id: number
  name: string
}

interface ActivityTemplateFormProps {
  mode: 'create' | 'edit'
  initialData?: {
    id?: number
    name: string
    description: string | null
    whenType: number
    when: string
    placeId: number | null
  }
}

const WEEK_DAYS = ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜']

export default function ActivityTemplateForm({ mode, initialData }: ActivityTemplateFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [whenType, setWhenType] = useState<0 | 1 | 2>(
    (initialData?.whenType as 0 | 1 | 2) ?? 0
  )
  const [when, setWhen] = useState(initialData?.when || '')
  const [placeId, setPlaceId] = useState<string>(
    initialData?.placeId !== null && initialData?.placeId !== undefined
      ? String(initialData.placeId)
      : ''
  )
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/places')
      .then((res) => (res.ok ? res.json() : { places: [] }))
      .then((data) => setPlaces(data.places || []))
      .catch(() => setPlaces([]))
  }, [])

  function handleWhenTypeChange(newType: 0 | 1 | 2) {
    setWhenType(newType)
    setWhen('')
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const url =
        mode === 'create'
          ? '/api/activity-templates'
          : `/api/activity-templates/${initialData?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const body: Record<string, unknown> = {
        name,
        description: description || null,
        whenType,
        when,
        placeId: placeId ? parseInt(placeId) : null,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        if (mode === 'create') {
          router.push('/activity-templates')
        } else {
          router.push(`/activity-templates/${initialData?.id}`)
        }
        router.refresh()
      } else {
        const j = await res.json().catch(() => ({}))
        setError(j?.error || '保存に失敗しました')
      }
    } catch {
      setError('ネットワークエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  async function onDelete() {
    if (!initialData?.id || mode !== 'edit') return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/activity-templates/${initialData.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.push('/activity-templates')
        router.refresh()
      } else {
        const j = await res.json().catch(() => ({}))
        setError(j?.error || '削除に失敗しました')
        setShowDeleteConfirm(false)
      }
    } catch {
      setError('ネットワークエラーが発生しました')
      setShowDeleteConfirm(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 w-full max-w-2xl">
      {error && (
        <div
          role="alert"
          className="px-4 py-3 bg-red-50 border border-red-300 rounded-md text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400 text-sm"
        >
          {error}
        </div>
      )}

      {/* テンプレート名 */}
      <div>
        <label
          htmlFor="template-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          テンプレート名 <span className="text-red-500">*</span>
        </label>
        <input
          id="template-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          placeholder="テンプレート名を入力"
        />
      </div>

      {/* 時間タイプ */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          時間タイプ <span className="text-red-500">*</span>
        </legend>
        <div className="flex gap-6">
          {([
            [0, '日付'],
            [1, '曜日'],
            [2, '時刻'],
          ] as [0 | 1 | 2, string][]).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="whenType"
                value={value}
                checked={whenType === value}
                onChange={() => handleWhenTypeChange(value)}
                className="text-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* 時間値 */}
      <div>
        <label
          htmlFor="when-input"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          時間値 <span className="text-red-500">*</span>
        </label>

        {whenType === 0 && (
          <input
            id="when-input"
            type="date"
            required
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            placeholder="YYYY-MM-DD"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        )}

        {whenType === 1 && (
          <select
            id="when-input"
            required
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="">曜日を選択</option>
            {WEEK_DAYS.map((day, index) => (
              <option key={index} value={String(index)}>
                {day}
              </option>
            ))}
          </select>
        )}

        {whenType === 2 && (
          <input
            id="when-input"
            type="time"
            required
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            placeholder="HH:MM"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          />
        )}
      </div>

      {/* 説明 */}
      <div>
        <label
          htmlFor="template-description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          説明（任意）
        </label>
        <textarea
          id="template-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          placeholder="説明を入力（任意）"
        />
      </div>

      {/* 場所 */}
      <div>
        <label
          htmlFor="template-place"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          場所（任意）
        </label>
        <select
          id="template-place"
          value={placeId}
          onChange={(e) => setPlaceId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="">選択しない</option>
          {places.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* ボタン */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? '処理中…' : mode === 'create' ? '作成' : '更新'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors dark:bg-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            キャンセル
          </button>
        </div>

        {mode === 'edit' &&
          (showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">本当に削除しますか？</span>
              <button
                type="button"
                onClick={onDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
              >
                削除する
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors dark:bg-gray-700 dark:text-gray-300 text-sm disabled:opacity-50"
              >
                やめる
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              削除
            </button>
          ))}
      </div>
    </form>
  )
}
