import { requireAuth } from "@/lib/auth";
import Layout from "@/components/Layout";
import CalendarWeekView from "@/activities/calendar/CalendarWeekView";

export default async function CalendarWeekPage() {
  const session = await requireAuth();
  return (
    <Layout session={session} headerTitle="週カレンダー">
      <CalendarWeekView />
    </Layout>
  );
}
