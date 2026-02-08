"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        router.push(`/auth/email-sent?email=${encodeURIComponent(email)}`)
      } else {
        const j = await res.json().catch(() => ({}))
        alert(j?.error || '認証に失敗しました')
      }
    } catch (e) {
      console.error('login fetch error', e)
      alert('ネットワークエラー')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full max-w-md">
      <input
        name="email"
        type="email"
        placeholder="メールアドレスを入力"
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        {loading ? '処理中…' : '認証'}
      </button>
    </form>
  )
}
