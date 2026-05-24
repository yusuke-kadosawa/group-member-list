import { requireAuth } from "@/lib/auth";
import Layout from "@/components/Layout";
import CalendarWeekView from "@/activities/calendar/CalendarWeekView";
import CalendarViewSwitcher from "@/activities/calendar/CalendarViewSwitcher";

function isoWeekToDate(year: number, week: number): string {
  // ISO週のMonday（週1の月曜日 = 1月4日を含む週の月曜日）を算出
  const jan4 = new Date(year, 0, 4);
  const dow = jan4.getDay() || 7; // 1=Mon … 7=Sun
  const monday1 = new Date(jan4);
  monday1.setDate(jan4.getDate() - dow + 1);
  const target = new Date(monday1);
  target.setDate(monday1.getDate() + (week - 1) * 7);
  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, "0");
  const d = String(target.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default async function CalendarWeekPage({
  params,
}: {
  params: Promise<{ year: string; week: string }>;
}) {
  const { year, week } = await params;
  const session = await requireAuth();
  const initialDate = isoWeekToDate(parseInt(year), parseInt(week));
  return (
    <Layout session={session} headerTitle="活動カレンダー">
      <CalendarViewSwitcher currentView="week" />
      <CalendarWeekView initialDate={initialDate} />
    </Layout>
  );
}
