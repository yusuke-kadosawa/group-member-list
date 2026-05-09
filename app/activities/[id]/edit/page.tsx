import { requireAuth } from "@/lib/auth"
import Layout from "@/components/Layout"
import EditActivityForm from "./EditActivityForm"

export default async function EditActivityPage() {
  const session = await requireAuth()

  return (
    <Layout session={session} headerTitle="活動編集">
      <EditActivityForm />
    </Layout>
  )
}
