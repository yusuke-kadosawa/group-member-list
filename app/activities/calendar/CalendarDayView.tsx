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

export default function CalendarDayView({ initialDate }: Props) {
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
      initialView="timeGridDay"
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
        const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T09:00`;
        return (
          <div className="fc-col-header-inner">
            <span>{arg.text}</span>
            <button
              className="fc-col-new-btn"
              aria-label={`${arg.text}に活動を作成`}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/activities/new?date=${encodeURIComponent(dateStr)}`);
              }}
            >
              +
            </button>
          </div>
        );
      }}
      slotLaneContent={(arg) => {
        if (arg.time == null) return null;
        const totalMs = arg.time.milliseconds;
        const h = String(Math.floor(totalMs / 3600000)).padStart(2, '0');
        const m = String(Math.floor((totalMs % 3600000) / 60000)).padStart(2, '0');
        return <span className="fc-slot-time-hint">{h}:{m}</span>;
      }}
      height="auto"
      locale="ja"
    />
  );
}
