import { auth, signOut } from "@/app/auth"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export default async function Home() {
  const renderStart = Date.now()
  let session: any = undefined
  if (typeof auth === 'function') {
    session = await auth()
  }

  // フォールバック: auth() がセッションを返さない場合、cookie を直接参照して DB の sessions を確認
  if (!session) {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("next-auth.session-token")?.value;
      if (token) {
        const dbSession = await prisma.session.findUnique({
          where: { sessionToken: token },
          include: { user: true },
        });
        if (dbSession && dbSession.expires > new Date()) {
          // 簡易的な session 形に合わせる
          session = { user: { id: dbSession.user.id, name: dbSession.user.name, email: dbSession.user.email } } as any;
        }
      }
    } catch (e) {
      console.error('session fallback error', e)
    }
  }

  if (!session) {
    console.log(`[home] no session - redirect to /auth/signin`)
    redirect("/auth/signin")
  }

  const renderDur = Date.now() - renderStart
  console.log(`[home] render for ${session.user?.email || 'unknown'} completed in ${renderDur}ms`)

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <header className="bg-white dark:bg-gray-900 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              ホーム
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 dark:text-gray-300">
                {session.user?.email}
              </span>
              <form action={async () => {
                "use server"
                await signOut({ redirectTo: "/" })
              }}>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  ログアウト
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                ようこそ、{session.user?.name || session.user?.email}さん！
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                グループメンバー管理システムへようこそ。<br />
                ここからグループ、ユーザー、活動などの管理ができます。
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    グループ管理
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    グループの作成とメンバー管理
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    ユーザー管理
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    ユーザーの招待と権限設定
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    活動管理
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    活動の計画と参加者管理
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}