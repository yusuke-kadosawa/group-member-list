export const dynamic = "force-dynamic"
import { requireAuth } from "@/lib/auth"
import ActivityRedirect from "./ActivityRedirect"

export default async function ActivitiesPage() {
  await requireAuth()
  return <ActivityRedirect />
}
