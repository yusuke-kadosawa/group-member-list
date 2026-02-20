import { requireAuth } from "@/lib/auth"
import NewActivityForm from "./NewActivityForm"

export default async function NewActivityPage() {
  const session = await requireAuth()
  
  return <NewActivityForm />
}
