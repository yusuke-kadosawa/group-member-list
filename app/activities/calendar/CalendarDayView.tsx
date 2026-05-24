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

function toDatetimeLocal(dateStr: string): string {
  return dateStr.includes('T') ? dateStr.slice(0, 16) : `${dateStr}T09:00`;
}

export default function CalendarDayView({ initialDate }: Props) {
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
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridDay"
      headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
      initialDate={initialDate}
      events={events}
      eventClick={(arg) => {
        arg.jsEvent.preventDefault();
        router.push(`/activities/${arg.event.id}`);
      }}
      dateClick={(arg) => router.push(`/activities/new?date=${encodeURIComponent(toDatetimeLocal(arg.dateStr))}`)}
      slotLaneContent={() => <span className="fc-slot-new-btn" aria-hidden="true">+</span>}
      height="auto"
      locale="ja"
    />
  );
}
