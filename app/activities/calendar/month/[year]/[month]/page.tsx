import { requireAuth } from "@/lib/auth";
import Layout from "@/components/Layout";
import CalendarMonthView from "@/activities/calendar/CalendarMonthView";

export default async function CalendarMonthPage() {
  const session = await requireAuth();
  return (
    <Layout session={session} headerTitle="月カレンダー">
      <CalendarMonthView />
    </Layout>
  );
}
