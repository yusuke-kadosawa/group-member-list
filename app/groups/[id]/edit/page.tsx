import { auth } from "@/app/auth"
import { redirect, notFound } from "next/navigation"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import GroupForm from "@/app/components/GroupForm"

export default async function EditGroupPage({ params }: { params: { id: string } }) {
  const id = parseInt(await Promise.resolve(params.id));

  if (isNaN(id)) {
    notFound();
  }

  const group = await prisma.group.findUnique({
    where: { id },
  });

  if (!group) {
    notFound();
  }

  let session: any = undefined
  if (typeof auth === 'function') {
    session = await auth()
  }

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
          session = { user: { id: dbSession.user.id, name: dbSession.user.name, email: dbSession.user.email } }
        }
      }
    } catch (e) {
      console.error('session fallback error', e)
    }
  }

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <header className="bg-white dark:bg-gray-900 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/groups" className="text-blue-600 dark:text-blue-400 hover:underline">
                ← グループ一覧
              </Link>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                グループ編集
              </h1>
            </div>
            <span className="text-gray-700 dark:text-gray-300">
              {session.user?.email}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
            <GroupForm mode="edit" initialData={group} />
          </div>
        </div>
      </main>
    </div>
  )
}
