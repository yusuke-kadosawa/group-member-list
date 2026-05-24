'use client';
import { useEffect } from "react";
import Link from "next/link";

type CalendarView = "day" | "week" | "month" | null;

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
  useEffect(() => {
    if (currentView) {
      localStorage.setItem('calendarView', currentView);
    }
  }, [currentView]);

  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  const { year: wy, week: w } = getISOWeek(today);

  const base =
    "px-3 py-1 rounded font-bold border shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-sm";

  const activeClass = `${base} bg-blue-600 text-white border-blue-600 focus:ring-blue-400`;
  const inactiveClass = `${base} bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 border-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-400`;

  const dayClass   = currentView === "day"   ? activeClass : inactiveClass;
  const weekClass  = currentView === "week"  ? activeClass : inactiveClass;
  const monthClass = currentView === "month" ? activeClass : inactiveClass;

  return (
    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-4 w-fit ml-auto">
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
