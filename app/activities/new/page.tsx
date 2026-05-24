import { requireAuth } from "@/lib/auth"
import Layout from "@/components/Layout"
import NewActivityForm from "./NewActivityForm"

export default async function NewActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const session = await requireAuth()
  const { date } = await searchParams

  return (
    <Layout session={session} headerTitle="新規活動作成">
      <NewActivityForm initialDate={date} />
    </Layout>
  )
}
