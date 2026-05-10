import { requireAuth } from "@/lib/auth"
import Layout from "@/components/Layout"
import ParticipantsManagement from "./ParticipantsManagement"

export default async function ActivityParticipantsPage() {
  const session = await requireAuth()

  return (
    <Layout session={session} headerTitle="参加者管理">
      <ParticipantsManagement />
    </Layout>
  )
}
