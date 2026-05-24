import { requireAuth } from "@/lib/auth";
import Layout from "@/components/Layout";
import CalendarDayView from "@/activities/calendar/CalendarDayView";
import CalendarViewSwitcher from "@/activities/calendar/CalendarViewSwitcher";

export default async function CalendarDayPage({
  params,
}: {
  params: Promise<{ year: string; month: string; day: string }>;
}) {
  const { year, month, day } = await params;
  const session = await requireAuth();
  const initialDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  return (
    <Layout session={session} headerTitle="日カレンダー">
      <CalendarViewSwitcher currentView="day" />
      <CalendarDayView initialDate={initialDate} />
    </Layout>
  );
}
