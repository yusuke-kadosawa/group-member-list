import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import Layout from "../components/Layout"
import ActivityList from "../components/ActivityList"

export default async function ActivitiesPage() {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  return (
    <Layout session={session} headerTitle="活動管理">
      <ActivityList />
    </Layout>
  )
}