"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type GroupFormProps = {
  initialData?: {
    id?: number
    name: string
    description?: string | null
  }
  mode: 'create' | 'edit'
}

export default function GroupForm({ initialData, mode }: GroupFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const url = mode === 'create' ? '/api/groups' : `/api/groups/${initialData?.id}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })

      if (res.ok) {
        router.push('/groups')
        router.refresh()
      } else {
        const j = await res.json().catch(() => ({}))
        alert(j?.error || '保存に失敗しました')
      }
    } catch (e) {
      console.error('group form submit error', e)
      alert('ネットワークエラー')
    } finally {
      setLoading(false)
    }
  }

  async function onDelete() {
    if (!initialData?.id || mode !== 'edit') return
    if (!confirm('このグループを削除しますか？')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${initialData.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.push('/groups')
        router.refresh()
      } else {
        const j = await res.json().catch(() => ({}))
        alert(j?.error || '削除に失敗しました')
      }
    } catch (e) {
      console.error('group delete error', e)
      alert('ネットワークエラー')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 w-full max-w-2xl">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          グループ名 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="グループ名を入力"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          説明
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="グループの説明を入力（任意）"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors dark:bg-gray-700 dark:text-gray-300"
          >
            キャンセル
          </button>
        </div>

        {mode === 'edit' && (
          <button
            type="button"
            onClick={onDelete}
            disabled={loading}
            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            削除
          </button>
        )}
      </div>
    </form>
  )
}
