"use client"
import React from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch('/api/logout', { method: 'POST' })
    } catch (e) {
      console.error('logout error', e)
    }
    setLoading(false)
    router.push('/')
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
    >
      {loading ? '処理中…' : 'ログアウト'}
    </button>
  )
}
