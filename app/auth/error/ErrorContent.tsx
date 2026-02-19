'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'サーバー設定エラーです。管理者に連絡してください。'
      case 'AccessDenied':
        return 'アクセスが拒否されました。'
      case 'Verification':
        return 'メール認証に失敗しました。再度お試しください。'
      case 'Default':
        return '認証エラーが発生しました。'
      default:
        return '不明なエラーが発生しました。'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            認証エラー
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getErrorMessage(error)}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="text-center">
            <Link
              href="/auth/signin"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              ログイン画面に戻る
            </Link>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>問題が解決しない場合は、管理者に連絡してください。</p>
          </div>
        </div>
      </div>
    </div>
  )
}