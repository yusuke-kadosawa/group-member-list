import { requireAuth } from "@/lib/auth"
import EditActivityForm from "./EditActivityForm"

export default async function EditActivityPage() {
  const session = await requireAuth()
  
  return <EditActivityForm />
}
