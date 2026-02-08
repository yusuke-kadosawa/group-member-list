'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setError('Invalid token')
      setLoading(false)
      return
    }

    // Call API to verify token and create session
    fetch(`/api/auth/verify?token=${token}`)
      .then(response => {
        if (response.redirected) {
          // If redirected, follow the redirect
          window.location.href = response.url
        } else if (response.ok) {
          // If successful, redirect to home
          router.push('/home')
        } else {
          return response.json().then(data => {
            throw new Error(data.error || 'Verification failed')
          })
        }
      })
      .catch(err => {
        console.error('verify error', err)
        setError(err.message || 'Server error')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [searchParams, router])

  if (loading) {
    return <div>Verifying...</div>
  }

  if (error) {
    return <div>Server error: {error}</div>
  }

  return <div>Redirecting...</div>
}