import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"

/**
 * 認証が必要なページで呼び出すヘルパー関数
 * セッションがない場合は自動的にログインページにリダイレクトする
 * @param redirectTo リダイレクト先（デフォルト: "/"）
 * @returns セッション情報
 */
export async function requireAuth(redirectTo: string = "/") {
  const session = await getSession()

  if (!session) {
    redirect(redirectTo)
  }

  return session
}
