import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const method = req.method
  const path = req.nextUrl.pathname
  const ts = new Date().toISOString()
  // 簡易的なリクエスト開始ログ
  console.log(`=> ${ts}  ${method} ${path} started`)
  // Next.js の middleware は downstream のレスポンスを待てないため
  // ここでは開始ログのみ出して処理を継続します。
  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
