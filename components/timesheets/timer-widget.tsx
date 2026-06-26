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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] border border-[var(--primary)] bg-[var(--primary)]/10 p-4">
        <div className="flex items-center gap-3">
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
      className="flex flex-wrap items-end gap-2 rounded-[var(--radius)] border border-[var(--border)] p-4"
    >
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
      {context?.ticketId ? <input type="hidden" name="ticketId" value={context.ticketId} /> : null}
      {context?.taskId ? <input type="hidden" name="taskId" value={context.taskId} /> : null}
      {context?.visitId ? <input type="hidden" name="visitId" value={context.visitId} /> : null}
      {context?.clientId ? <input type="hidden" name="clientId" value={context.clientId} /> : null}
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="timer-desc" className="text-xs text-[var(--muted-foreground)]">
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
      <Button type="submit" variant="outline">Start timer</Button>
    </form>
  );
}
