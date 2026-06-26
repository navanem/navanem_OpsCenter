"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FREQUENCIES, WEEKDAYS } from "@/lib/planning/meta";
import type { RecurringFormState } from "../actions";

type Action = (state: RecurringFormState, formData: FormData) => Promise<RecurringFormState>;

export interface RecurringDefaults {
  id?: string;
  title?: string;
  description?: string | null;
  typeId?: string;
  clientId?: string | null;
  assigneeId?: string | null;
  location?: string | null;
  durationMinutes?: number;
  frequency?: string;
  interval?: number;
  weekdays?: number[];
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  timeHour?: number;
  timeMinute?: number;
}

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

function toDateString(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  const p = (n: number) => `${n}`.padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

export function RecurringForm({
  action,
  types,
  clients,
  technicians,
  defaults,
  submitLabel,
}: {
  action: Action;
  types: { id: string; name: string }[];
  clients: { id: string; companyName: string }[];
  technicians: { id: string; firstName: string; lastName: string }[];
  defaults?: RecurringDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as RecurringFormState);
  const selectedDays = new Set(defaults?.weekdays ?? []);

  return (
    <form action={formAction} className="space-y-6">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="title" className="text-sm text-[var(--muted-foreground)]">Title *</label>
          <input id="title" name="title" type="text" required defaultValue={defaults?.title ?? ""} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="typeId" className="text-sm text-[var(--muted-foreground)]">Type *</label>
          <select id="typeId" name="typeId" required defaultValue={defaults?.typeId ?? ""} className={inputClass}>
            <option value="" disabled>Select a type</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="location" className="text-sm text-[var(--muted-foreground)]">Location</label>
          <input id="location" name="location" type="text" defaultValue={defaults?.location ?? ""} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="clientId" className="text-sm text-[var(--muted-foreground)]">Client</label>
          <select id="clientId" name="clientId" defaultValue={defaults?.clientId ?? ""} className={inputClass}>
            <option value="">None</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="assigneeId" className="text-sm text-[var(--muted-foreground)]">Technician</label>
          <select id="assigneeId" name="assigneeId" defaultValue={defaults?.assigneeId ?? ""} className={inputClass}>
            <option value="">Unassigned</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="frequency" className="text-sm text-[var(--muted-foreground)]">Frequency *</label>
          <select id="frequency" name="frequency" required defaultValue={defaults?.frequency ?? "WEEKLY"} className={inputClass}>
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="interval" className="text-sm text-[var(--muted-foreground)]">Every (interval)</label>
          <input id="interval" name="interval" type="number" min={1} defaultValue={defaults?.interval ?? 1} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="startDate" className="text-sm text-[var(--muted-foreground)]">Start date *</label>
          <input id="startDate" name="startDate" type="date" required defaultValue={toDateString(defaults?.startDate)} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="endDate" className="text-sm text-[var(--muted-foreground)]">End date</label>
          <input id="endDate" name="endDate" type="date" defaultValue={toDateString(defaults?.endDate)} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="timeHour" className="text-sm text-[var(--muted-foreground)]">Time (hour)</label>
          <input id="timeHour" name="timeHour" type="number" min={0} max={23} defaultValue={defaults?.timeHour ?? 9} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="timeMinute" className="text-sm text-[var(--muted-foreground)]">Time (minute)</label>
          <input id="timeMinute" name="timeMinute" type="number" min={0} max={59} defaultValue={defaults?.timeMinute ?? 0} className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-[var(--muted-foreground)]">Weekdays (weekly only)</span>
        <div className="flex flex-wrap gap-3">
          {WEEKDAYS.map((w) => (
            <label key={w.value} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" name="weekdays" value={w.value} defaultChecked={selectedDays.has(w.value)} className="h-4 w-4 cursor-pointer" />
              {w.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm text-[var(--muted-foreground)]">Description</label>
        <textarea id="description" name="description" rows={3} defaultValue={defaults?.description ?? ""} className={inputClass} />
      </div>

      <p className="text-xs text-[var(--muted-foreground)]">
        Occurrences are generated for the next 90 days.
      </p>

      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}

      <Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button>
    </form>
  );
}
