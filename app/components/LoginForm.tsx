"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MESSAGES } from "@/app/constants/messages";

type Props = {
  dbAvailable: boolean
}

export default function LoginForm({ dbAvailable }: Props) {
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

      const data = await res.json()

      if (res.ok && data.ok) {
        router.push(`/auth/email-sent?email=${encodeURIComponent(email)}`)
      } else {
        alert(MESSAGES.AUTH_FAILED)
      }
    } catch (e) {
      console.error('login error', e)
      alert(MESSAGES.AUTH_EMAIL_SEND_ERROR)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 w-full max-w-md">
      {!dbAvailable && (
        <p className="text-sm text-red-500">サービスは現在利用できません</p>
      )}
      <input
        name="email"
        type="email"
        placeholder={MESSAGES.AUTH_EMAIL_INPUT_REQUIRED}
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={!dbAvailable}
      />
      <button
        type="submit"
        disabled={loading || !dbAvailable}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? MESSAGES.AUTH_LOADING : '認証'}
      </button>
    </form>
  )
}
