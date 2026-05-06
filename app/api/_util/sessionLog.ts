// 共通のセッションログユーティリティ
import { getServerSession } from '@/lib/session'

/**
 * APIルートでセッション取得＋ログ出力
 * @param req NextRequest
 * @returns セッション or null
 */
export async function getSessionWithLog(req: any, context?: any) {
  const session = await getServerSession()
  // context情報も出力（API名やparamsなど）
  console.log('[getServerSession]', {
    url: req?.url,
    method: req?.method,
    params: context?.params,
    session
  })
  return session
}
