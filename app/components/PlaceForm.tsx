"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const PlaceMapEditable = dynamic(() => import('@/app/components/PlaceMapEditable'), { ssr: false })

const FALLBACK_LAT = 35.6812
const FALLBACK_LNG = 139.7671

type PlaceFormProps = {
  initialData?: {
    id?: number
    name: string
    latitude?: number | null
    longitude?: number | null
  }
  mode: 'create' | 'edit'
}

export default function PlaceForm({ initialData, mode }: PlaceFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [latitude, setLatitude] = useState(
    initialData?.latitude !== null && initialData?.latitude !== undefined
      ? initialData.latitude.toString()
      : ''
  )
  const [longitude, setLongitude] = useState(
    initialData?.longitude !== null && initialData?.longitude !== undefined
      ? initialData.longitude.toString()
      : ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()

  const lat = parseFloat(latitude)
  const lng = parseFloat(longitude)
  const hasValidCoords =
    !isNaN(lat) && !isNaN(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180

  function handleLocationSelect(newLat: number, newLng: number) {
    setLatitude(newLat.toFixed(7))
    setLongitude(newLng.toFixed(7))
    setError(null)
  }

  function clearCoords() {
    setLatitude('')
    setLongitude('')
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const url = mode === 'create' ? '/api/places' : `/api/places/${initialData?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const body: {
        name: string
        latitude: number | null
        longitude: number | null
      } = {
        name,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        router.push('/places')
        router.refresh()
      } else {
        const j = await res.json().catch(() => ({}))
        setError(j?.error || '保存に失敗しました')
      }
    } catch (e) {
      console.error('place form submit error', e)
      setError('ネットワークエラー')
    } finally {
      setLoading(false)
    }
  }

  async function onDelete() {
    if (!initialData?.id || mode !== 'edit') return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/places/${initialData.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.push('/places')
        router.refresh()
      } else {
        const j = await res.json().catch(() => ({}))
        setError(j?.error || '削除に失敗しました')
        setShowDeleteConfirm(false)
      }
    } catch (e) {
      console.error('place delete error', e)
      setError('ネットワークエラー')
      setShowDeleteConfirm(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 w-full max-w-2xl">
      {error && (
        <div role="alert" className="px-4 py-3 bg-red-50 border border-red-300 rounded-md text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          場所名 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="場所名を入力"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">緯度 / 経度</span>
          {(latitude || longitude) && (
            <button
              type="button"
              onClick={clearCoords}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              座標をクリア
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="latitude" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">緯度（-90〜90）</label>
            <input
              id="latitude"
              name="latitude"
              type="number"
              step="0.0000001"
              min="-90"
              max="90"
              placeholder="例: 35.6812360"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="longitude" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">経度（-180〜180）</label>
            <input
              id="longitude"
              name="longitude"
              type="number"
              step="0.0000001"
              min="-180"
              max="180"
              placeholder="例: 139.7671250"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>
        </div>
        <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
          {hasValidCoords ? '地図をクリックすると位置を変更できます' : '地図をクリックすると座標を自動入力できます'}
        </p>
      </div>

      <div className="rounded-lg overflow-hidden shadow">
        <PlaceMapEditable
          latitude={hasValidCoords ? lat : FALLBACK_LAT}
          longitude={hasValidCoords ? lng : FALLBACK_LNG}
          placeName={hasValidCoords ? (name || undefined) : undefined}
          showMarker={hasValidCoords}
          onLocationSelect={handleLocationSelect}
        />
      </div>

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

        {mode === 'edit' && (
          showDeleteConfirm ? (
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
          )
        )}
      </div>
    </form>
  )
}
