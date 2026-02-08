import React from "react"
import NavigationItem from "./NavigationItem"

interface LayoutProps {
  children: React.ReactNode
  session: any
}

const Layout: React.FC<LayoutProps> = ({ children, session }) => {
  if (!session) {
    return null // セッションがない場合は何も表示しない
  }

  return (
    <div className="flex">
      <aside className="w-64 bg-white dark:bg-gray-800 h-full shadow-md">
        <nav className="flex flex-col gap-2">
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
          />
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  )
}

export default Layout