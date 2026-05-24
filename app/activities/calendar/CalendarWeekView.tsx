'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

interface Props {
  initialDate?: string;
}

interface Activity {
  id: number;
  name: string;
  startedAt: string;
  finishedAt: string | null;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toDatetimeLocal(dateStr: string): string {
  return dateStr.includes('T') ? dateStr.slice(0, 16) : `${dateStr}T09:00`;
}

export default function CalendarWeekView({ initialDate }: Props) {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/activities')
      .then((r) => r.json())
      .then((data) => {
        const acts: Activity[] = data.activities ?? [];
        setEvents(
          acts.map((a) => ({
            id: String(a.id),
            title: a.name,
            start: a.startedAt,
            end: a.finishedAt ?? undefined,
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
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

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
      buttonText={{ today: '今日', month: '月', week: '週', day: '日' }}
      initialDate={initialDate}
      events={events}
      eventClick={(arg) => {
        arg.jsEvent.preventDefault();
        router.push(`/activities/${arg.event.id}`);
      }}
      dateClick={(arg) => router.push(`/activities/new?date=${encodeURIComponent(toDatetimeLocal(arg.dateStr))}`)}
      selectable={true}
      selectMinDistance={5}
      select={(arg) => {
        const start = arg.startStr.slice(0, 16);
        const end = arg.endStr.slice(0, 16);
        router.push(`/activities/new?date=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
      }}
      navLinks={false}
      dayHeaderContent={(arg) => {
        const d = arg.date;
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const dayUrl = `/activities/calendar/day/${year}/${month}/${day}`;
        return (
          <span
            className="fc-col-header-day-text"
            onClick={() => router.push(dayUrl)}
          >
            {arg.text}
          </span>
        );
      }}
      dayCellContent={(arg) => {
        const d = arg.date;
        const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T09:00`;
        return (
          <div className="fc-week-allday-cell">
            <button
              className="fc-week-allday-new-btn"
              aria-label={`${arg.dayNumberText}に活動を作成`}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/activities/new?date=${encodeURIComponent(dateStr)}`);
              }}
            >
              <span aria-hidden="true">+</span>
              <span className="fc-week-allday-new-label">追加</span>
            </button>
          </div>
        );
      }}
      height="auto"
      locale="ja"
    />
  );
}
