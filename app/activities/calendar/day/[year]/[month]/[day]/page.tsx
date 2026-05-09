import { requireAuth } from "@/lib/auth";
import Layout from "@/components/Layout";
import CalendarDayView from "@/activities/calendar/CalendarDayView";

export default async function CalendarDayPage() {
  const session = await requireAuth();
  return (
    <Layout session={session} headerTitle="日カレンダー">
      <CalendarDayView />
    </Layout>
  );
}
