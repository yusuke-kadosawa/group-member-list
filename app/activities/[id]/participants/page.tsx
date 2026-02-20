import { requireAuth } from "@/lib/auth"
import ParticipantsManagement from "./ParticipantsManagement"

export default async function ActivityParticipantsPage() {
  const session = await requireAuth()
  
  return <ParticipantsManagement />
}
