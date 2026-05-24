import Link from "next/link";

type CalendarView = "day" | "week" | "month";

interface Props {
  currentView: CalendarView;
}

function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return {
    year: d.getUTCFullYear(),
    week: Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7),
  };
}

export default function CalendarViewSwitcher({ currentView }: Props) {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  const { year: wy, week: w } = getISOWeek(today);

  const base =
    "px-3 py-1 rounded font-bold border shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";

  const dayClass =
    currentView === "day"
      ? `${base} bg-blue-600 text-white border-blue-600 focus:ring-blue-400`
      : `${base} bg-white text-blue-700 border-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-400`;

  const weekClass =
    currentView === "week"
      ? `${base} bg-green-600 text-white border-green-600 focus:ring-green-400`
      : `${base} bg-white text-green-700 border-green-600 hover:bg-green-600 hover:text-white focus:ring-green-400`;

  const monthClass =
    currentView === "month"
      ? `${base} bg-purple-600 text-white border-purple-600 focus:ring-purple-400`
      : `${base} bg-white text-purple-700 border-purple-600 hover:bg-purple-600 hover:text-white focus:ring-purple-400`;

  return (
    <div className="flex gap-2 justify-end mb-4">
      <Link
        href={`/activities/calendar/day/${y}/${m}/${d}`}
        className={dayClass}
        aria-label="日カレンダー表示"
        aria-current={currentView === "day" ? "page" : undefined}
      >
        日
      </Link>
      <Link
        href={`/activities/calendar/week/${wy}/${w}`}
        className={weekClass}
        aria-label="週カレンダー表示"
        aria-current={currentView === "week" ? "page" : undefined}
      >
        週
      </Link>
      <Link
        href={`/activities/calendar/month/${y}/${m}`}
        className={monthClass}
        aria-label="月カレンダー表示"
        aria-current={currentView === "month" ? "page" : undefined}
      >
        月
      </Link>
    </div>
  );
}
