import { getServerSession } from "next-auth"
import type { Session } from "next-auth"
import authOptions from "@/app/auth"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import Layout from "../components/Layout"
import UserList from "../components/UserList"

export default async function UsersPage() {
  let session: Session | null = await getServerSession(authOptions)

  // フォールバック: session が取得できない場合、cookie を直接参照
  if (!session) {
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get("next-auth.session-token")?.value
      if (token) {
        const dbSession = await prisma.session.findUnique({
          where: { sessionToken: token },
          include: { user: true },
        })
        if (dbSession && dbSession.expires > new Date()) {
          session = { user: { id: dbSession.user.id, name: dbSession.user.name, email: dbSession.user.email } } as any
        }
      }
    } catch (e) {
      console.error('session fallback error', e)
    }
  }

  if (!session) {
    redirect("/")
  }

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