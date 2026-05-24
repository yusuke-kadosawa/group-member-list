'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
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

export default function CalendarMonthView({ initialDate }: Props) {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);

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
      .catch(console.error);
  }, []);

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
      initialDate={initialDate}
      events={events}
      eventClick={(arg) => {
        arg.jsEvent.preventDefault();
        router.push(`/activities/${arg.event.id}`);
      }}
      dateClick={(arg) => router.push(`/activities/new?date=${encodeURIComponent(toDatetimeLocal(arg.dateStr))}`)}
      dayCellContent={(arg) => {
        const d = arg.date;
        const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T09:00`;
        return (
          <div className="fc-daygrid-day-top-inner">
            <a className="fc-daygrid-day-number" role="gridcell" aria-label={arg.dayNumberText}>
              {arg.dayNumberText}
            </a>
            <button
              className="fc-cell-new-btn"
              aria-label={`${arg.dayNumberText}に活動を作成`}
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
      height="auto"
      locale="ja"
    />
  );
}
