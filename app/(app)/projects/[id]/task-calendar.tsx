"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export interface CalendarTask {
  id: string;
  title: string;
  startDate: Date | string | null;
  dueDate: Date | string | null;
  status: { name: string; color: string };
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function TaskCalendar({
  tasks,
  projectId,
  initialYear,
  initialMonth,
}: {
  tasks: CalendarTask[];
  projectId: string;
  initialYear: number;
  initialMonth: number; // 0-based
}) {
  const [cur, setCur] = useState({ y: initialYear, m: initialMonth });

  const firstOfMonth = new Date(cur.y, cur.m, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(cur.y, cur.m + 1, 0).getDate();

  // Tasks falling in the current month, keyed by day-of-month (by due date, else start date).
  const byDay = new Map<number, CalendarTask[]>();
  for (const t of tasks) {
    const ref = t.dueDate ?? t.startDate;
    if (!ref) continue;
    const d = new Date(ref);
    if (d.getFullYear() === cur.y && d.getMonth() === cur.m) {
      const day = d.getDate();
      const arr = byDay.get(day) ?? [];
      arr.push(t);
      byDay.set(day, arr);
    }
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = firstOfMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const shift = (delta: number) => {
    const d = new Date(cur.y, cur.m + delta, 1);
    setCur({ y: d.getFullYear(), m: d.getMonth() });
  };
  const goToday = () => {
    const n = new Date();
    setCur({ y: n.getFullYear(), m: n.getMonth() });
  };

  const btn = "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-1.5 text-sm hover:bg-[var(--muted)]/70";

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium">{monthLabel}</span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => shift(-1)} className={btn}>‹</button>
          <button type="button" onClick={goToday} className={btn}>Today</button>
          <button type="button" onClick={() => shift(1)} className={btn}>›</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--border)]">
        {WEEKDAYS.map((w) => (
          <div key={w} className="bg-[var(--card)] px-2 py-1.5 text-center text-xs font-medium text-[var(--muted-foreground)]">
            {w}
          </div>
        ))}
        {cells.map((day, i) => (
          <div key={i} className="min-h-[84px] bg-[var(--card)] p-1.5">
            {day !== null ? (
              <>
                <span className="text-xs text-[var(--muted-foreground)]">{day}</span>
                <div className="mt-1 space-y-1">
                  {(byDay.get(day) ?? []).map((t) => (
                    <Link
                      key={t.id}
                      href={`/projects/${projectId}/tasks/${t.id}/edit`}
                      className="flex items-center gap-1 truncate rounded px-1 py-0.5 text-xs text-white"
                      style={{ backgroundColor: t.status.color }}
                      title={`${t.title} · ${t.status.name}`}
                    >
                      <span className="truncate">{t.title}</span>
                    </Link>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
