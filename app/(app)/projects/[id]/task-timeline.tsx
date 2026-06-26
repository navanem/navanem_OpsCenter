"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";

export interface TimelineTask {
  id: string;
  title: string;
  startDate: Date | string | null;
  dueDate: Date | string | null;
  status: { name: string; color: string };
}

const DAY_MS = 86400000;
function dayNum(d: Date): number {
  return Math.floor(new Date(d).getTime() / DAY_MS);
}

export function TaskTimeline({ tasks, projectId }: { tasks: TimelineTask[]; projectId: string }) {
  const scheduled = tasks
    .map((t) => {
      const start = t.startDate ?? t.dueDate;
      const end = t.dueDate ?? t.startDate;
      if (!start || !end) return null;
      const s = new Date(start);
      const e = new Date(end);
      return { task: t, sDay: dayNum(s < e ? s : e), eDay: dayNum(e > s ? e : s) };
    })
    .filter((x): x is { task: TimelineTask; sDay: number; eDay: number } => x !== null);

  const unscheduled = tasks.filter((t) => !t.startDate && !t.dueDate);

  if (scheduled.length === 0) {
    return (
      <Card>
        <p className="p-6 text-[var(--muted-foreground)]">
          No scheduled tasks. Add a start or due date to a task to see it on the timeline.
        </p>
      </Card>
    );
  }

  const minDay = Math.min(...scheduled.map((s) => s.sDay));
  const maxDay = Math.max(...scheduled.map((s) => s.eDay));
  const totalDays = Math.max(1, maxDay - minDay + 1);

  // Month markers across the range.
  const months: { label: string; leftPct: number }[] = [];
  const first = new Date(minDay * DAY_MS);
  const cursor = new Date(first.getFullYear(), first.getMonth(), 1);
  const last = new Date(maxDay * DAY_MS);
  while (cursor <= last) {
    const off = dayNum(cursor) - minDay;
    if (off >= 0) {
      months.push({
        label: cursor.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
        leftPct: (off / totalDays) * 100,
      });
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const fmt = (d: Date | string) => new Date(d).toLocaleDateString();

  return (
    <Card className="overflow-x-auto p-4">
      <div className="min-w-[640px]">
        {/* Axis */}
        <div className="grid grid-cols-[180px_1fr] gap-2">
          <div />
          <div className="relative mb-2 h-5 border-b border-[var(--border)]">
            {months.map((m, i) => (
              <span
                key={i}
                className="absolute top-0 text-xs text-[var(--muted-foreground)]"
                style={{ left: `${m.leftPct}%` }}
              >
                {m.label}
              </span>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-1.5">
          {scheduled.map(({ task, sDay, eDay }) => {
            const leftPct = ((sDay - minDay) / totalDays) * 100;
            const widthPct = Math.max(2, ((eDay - sDay + 1) / totalDays) * 100);
            return (
              <div key={task.id} className="grid grid-cols-[180px_1fr] items-center gap-2">
                <Link
                  href={`/projects/${projectId}/tasks/${task.id}/edit`}
                  className="truncate text-sm font-medium hover:underline"
                  title={task.title}
                >
                  {task.title}
                </Link>
                <div className="relative h-6 rounded-[var(--radius-sm)] bg-[var(--muted)]/40">
                  {/* month gridlines */}
                  {months.map((m, i) => (
                    <span key={i} className="absolute top-0 bottom-0 w-px bg-[var(--border)]/50" style={{ left: `${m.leftPct}%` }} />
                  ))}
                  <Link
                    href={`/projects/${projectId}/tasks/${task.id}/edit`}
                    className="absolute top-0 flex h-6 items-center overflow-hidden rounded-[var(--radius-sm)] px-2"
                    style={{ left: `${leftPct}%`, width: `${widthPct}%`, backgroundColor: task.status.color }}
                    title={`${task.title} · ${fmt(task.startDate ?? task.dueDate!)} → ${fmt(task.dueDate ?? task.startDate!)} · ${task.status.name}`}
                  >
                    <span className="truncate text-xs font-medium text-white">{task.title}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {unscheduled.length > 0 ? (
          <div className="mt-4 border-t border-[var(--border)] pt-3">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
              Unscheduled ({unscheduled.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {unscheduled.map((t) => (
                <Link
                  key={t.id}
                  href={`/projects/${projectId}/tasks/${t.id}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2 py-0.5 text-xs hover:bg-[var(--muted)]/40"
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: t.status.color }} />
                  {t.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
