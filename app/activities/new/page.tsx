import { requireAuth } from "@/lib/auth"
import Layout from "@/components/Layout"
import NewActivityForm from "./NewActivityForm"

export default async function NewActivityPage() {
  const session = await requireAuth()

  return (
    <Layout session={session} headerTitle="新規活動作成">
      <NewActivityForm />
    </Layout>
  )
}
