"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { TimeEntryFormState } from "@/app/(app)/timesheets/actions";

type Action = (state: TimeEntryFormState, formData: FormData) => Promise<TimeEntryFormState>;

export interface TimeEntryDefaults {
  id?: string;
  date?: string; // yyyy-MM-dd
  hours?: number;
  minutes?: number;
  description?: string | null;
  billable?: boolean;
  hourlyRate?: string;
}

export interface TimeEntryContext {
  ticketId?: string;
  taskId?: string;
  visitId?: string;
  clientId?: string;
  label?: string;
}

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

function todayString(): string {
  const d = new Date();
  const p = (n: number) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function TimeEntryForm({
  action,
  submitLabel,
  redirectTo,
  defaults,
  context,
  clients,
  compact,
}: {
  action: Action;
  submitLabel: string;
  redirectTo?: string;
  defaults?: TimeEntryDefaults;
  context?: TimeEntryContext;
  clients?: { id: string; companyName: string }[];
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {} as TimeEntryFormState);

  return (
    <form action={formAction} className="space-y-4">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
      {context?.ticketId ? <input type="hidden" name="ticketId" value={context.ticketId} /> : null}
      {context?.taskId ? <input type="hidden" name="taskId" value={context.taskId} /> : null}
      {context?.visitId ? <input type="hidden" name="visitId" value={context.visitId} /> : null}
      {context?.clientId ? <input type="hidden" name="clientId" value={context.clientId} /> : null}

      {context?.label ? (
        <p className="text-xs text-[var(--muted-foreground)]">{context.label}</p>
      ) : null}

      <div className={compact ? "grid gap-3 sm:grid-cols-2" : "grid gap-4 sm:grid-cols-2"}>
        <div className="flex flex-col gap-1">
          <label htmlFor="date" className="text-sm text-[var(--muted-foreground)]">Date *</label>
          <input id="date" name="date" type="date" required defaultValue={defaults?.date ?? todayString()} className={inputClass} />
        </div>

        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="hours" className="text-sm text-[var(--muted-foreground)]">Hours</label>
            <input id="hours" name="hours" type="number" min={0} max={99} defaultValue={defaults?.hours ?? 0} className={`${inputClass} w-20`} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="minutes" className="text-sm text-[var(--muted-foreground)]">Minutes</label>
            <input id="minutes" name="minutes" type="number" min={0} max={59} defaultValue={defaults?.minutes ?? 0} className={`${inputClass} w-20`} />
          </div>
        </div>

        {clients && !context ? (
          <div className="flex flex-col gap-1">
            <label htmlFor="clientId" className="text-sm text-[var(--muted-foreground)]">Client</label>
            <select id="clientId" name="clientId" defaultValue="" className={inputClass}>
              <option value="">None</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="flex flex-col gap-1">
          <label htmlFor="hourlyRate" className="text-sm text-[var(--muted-foreground)]">Hourly rate</label>
          <input id="hourlyRate" name="hourlyRate" type="text" inputMode="decimal" placeholder="e.g. 120.00" defaultValue={defaults?.hourlyRate ?? ""} className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm text-[var(--muted-foreground)]">Description</label>
        <textarea id="description" name="description" rows={compact ? 2 : 3} defaultValue={defaults?.description ?? ""} className={inputClass} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="billable" value="true" defaultChecked={defaults?.billable ?? true} className="h-4 w-4 cursor-pointer" />
        Billable
      </label>

      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}

      <Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button>
    </form>
  );
}
