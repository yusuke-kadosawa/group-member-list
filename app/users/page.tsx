import { requireAuth } from "@/lib/auth"
import { prisma } from "@/prisma"
import Link from "next/link"
import Layout from "../components/Layout"
import UserList from "../components/UserList"

export default async function UsersPage() {
  const session = await requireAuth()


  // UserListのUser型（id: string）に合わせてidをstring化
  const users = (await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })).map(u => ({ ...u, id: String(u.id) }))

  return (
    <Layout
      session={session}
      headerTitle="ユーザー管理"
    >
      <div className="flex justify-end mb-6">
        <Link
          href="/users/invite"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          招待
        </Link>
      </div>
      <UserList users={users} />
    </Layout>
  )
}
