export const dynamic = "force-dynamic"

import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import Layout from '@/components/Layout'
import ActivityTemplateForm from '@/components/ActivityTemplateForm'

export default async function NewActivityTemplatePage() {
  const session = await requireAuth()

  return (
    <Layout session={session} headerTitle="テンプレート新規作成">
      <div className="mb-4">
        <Link
          href="/activity-templates"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← テンプレート一覧
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
        <ActivityTemplateForm mode="create" />
      </div>
    </Layout>
  )
}
