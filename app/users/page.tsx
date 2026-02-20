import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Layout from "../components/Layout"
import UserList from "../components/UserList"

export default async function UsersPage() {
  const session = await requireAuth()

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <Layout session={session} headerTitle="ユーザー一覧">
      <UserList users={users} />
    </Layout>
  )
}