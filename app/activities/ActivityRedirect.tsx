'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

export default function ActivityRedirect() {
  const router = useRouter();

  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    const { year: wy, week: w } = getISOWeek(today);

    const saved = localStorage.getItem('calendarView') as 'day' | 'week' | 'month' | null;

    if (saved === 'day') {
      router.replace(`/activities/calendar/day/${y}/${m}/${d}`);
    } else if (saved === 'month') {
      router.replace(`/activities/calendar/month/${y}/${m}`);
    } else {
      // デフォルト: 今週の週カレンダー
      router.replace(`/activities/calendar/week/${wy}/${w}`);
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center py-20 text-gray-400 dark:text-gray-500">
      <svg className="animate-spin h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      読み込み中...
    </div>
  );
}
