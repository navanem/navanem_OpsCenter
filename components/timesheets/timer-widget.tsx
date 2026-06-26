"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  startTimerAction,
  stopTimerAction,
  cancelTimerAction,
} from "@/app/(app)/timesheets/actions";

export interface TimerContext {
  ticketId?: string;
  taskId?: string;
  visitId?: string;
  clientId?: string;
  label?: string;
}

function Elapsed({ startedAt }: { startedAt: string }) {
  const [text, setText] = useState("…");
  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const pad = (n: number) => `${n}`.padStart(2, "0");
    const tick = () => {
      const s = Math.max(0, Math.floor((Date.now() - start) / 1000));
      setText(`${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  return <span className="font-mono text-2xl tabular-nums">{text}</span>;
}

export function TimerWidget({
  running,
  redirectTo,
  context,
}: {
  running: { startedAt: string; label: string } | null;
  redirectTo?: string;
  context?: TimerContext;
}) {
  if (running) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--primary)] bg-gradient-to-r from-[var(--primary)]/15 to-transparent p-4 shadow-[var(--shadow)]">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
          </span>
          <Elapsed startedAt={running.startedAt} />
          <span className="text-sm text-[var(--muted-foreground)]">{running.label}</span>
        </div>
        <div className="flex gap-2">
          <form action={stopTimerAction}>
            {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
            <Button type="submit">Stop &amp; save</Button>
          </form>
          <form action={cancelTimerAction}>
            {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
            <Button type="submit" variant="outline">Cancel</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <form
      action={startTimerAction}
      className="flex flex-wrap items-end gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]"
    >
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
      {context?.ticketId ? <input type="hidden" name="ticketId" value={context.ticketId} /> : null}
      {context?.taskId ? <input type="hidden" name="taskId" value={context.taskId} /> : null}
      {context?.visitId ? <input type="hidden" name="visitId" value={context.visitId} /> : null}
      {context?.clientId ? <input type="hidden" name="clientId" value={context.clientId} /> : null}
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/15 text-[var(--primary)]" aria-hidden>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      </span>
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="timer-desc" className="text-xs font-medium text-[var(--muted-foreground)]">
          {context?.label ? `Start a timer — ${context.label}` : "Start a timer"}
        </label>
        <input
          id="timer-desc"
          name="description"
          type="text"
          placeholder="What are you working on?"
          className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        />
      </div>
      <Button type="submit">Start timer</Button>
    </form>
  );
}
