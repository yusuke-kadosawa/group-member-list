import { requireAuth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import GroupForm from "@/app/components/GroupForm"
import Layout from "@/app/components/Layout"

export default async function EditGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const groupId = parseInt(id);

  if (isNaN(groupId)) {
    notFound();
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    notFound();
  }

  const session = await requireAuth()

  return (
    <Layout session={session} headerTitle="グループ編集">
      <div className="mb-4">
        <Link href="/groups" className="text-blue-600 dark:text-blue-400 hover:underline">
          ← グループ一覧
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <GroupForm mode="edit" initialData={group} />
      </div>
    </Layout>
  )
}
