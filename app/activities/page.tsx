import { requireAuth } from "@/lib/auth"
import Layout from "../components/Layout"
import ActivityList from "../components/ActivityList"

export default async function ActivitiesPage() {
  const session = await requireAuth()

  return (
    <Layout session={session} headerTitle="活動管理">
      <ActivityList />
    </Layout>
  )
}