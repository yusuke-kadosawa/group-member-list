import React from "react"
import NavigationItem from "./NavigationItem"
import LogoutButton from "./LogoutButton"

interface LayoutProps {
  children: React.ReactNode
  session: any
  headerTitle?: string // ヘッダーのタイトルを受け取るプロパティを追加
}

const Layout: React.FC<LayoutProps> = ({ children, session, headerTitle }) => {
  if (!session) {
    return null // セッションがない場合は何も表示しない
  }

  return (
    <div className="flex">
      <aside className="w-64 bg-white dark:bg-gray-800 h-full shadow-md">
        <nav className="flex flex-col gap-2">
          <NavigationItem
            title="ホーム"
            description="ダッシュボード"
            href="/home"
          />
          <NavigationItem
            title="グループ管理"
            description="グループの作成とメンバー管理"
            href="/groups"
          />
          <NavigationItem
            title="ユーザー管理"
            description="ユーザーの招待と権限設定"
            href="/users"
          />
          <NavigationItem
            title="活動管理"
            description="活動の計画と参加者管理"
            href="/activities"
            disabled
          />
        </nav>
      </aside>
      <main className="flex-1">
        {headerTitle && (
          <header className="bg-white dark:bg-gray-900 shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {headerTitle}
                </h1>
                <div className="flex items-center gap-4">
                  <span className="text-gray-700 dark:text-gray-300">
                    {session.user?.email}
                  </span>
                  <LogoutButton />
                </div>
              </div>
            </div>
          </header>
        )}
        {children}
      </main>
    </div>
  )
}

export default Layout