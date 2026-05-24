import { requireAuth } from "@/lib/auth";
import Layout from "@/components/Layout";
import CalendarMonthView from "@/activities/calendar/CalendarMonthView";
import CalendarViewSwitcher from "@/activities/calendar/CalendarViewSwitcher";

export default async function CalendarMonthPage({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year, month } = await params;
  const session = await requireAuth();
  const initialDate = `${year}-${month.padStart(2, "0")}-01`;
  return (
    <Layout session={session} headerTitle="活動カレンダー">
      <CalendarViewSwitcher currentView="month" />
      <CalendarMonthView initialDate={initialDate} />
    </Layout>
  );
}
