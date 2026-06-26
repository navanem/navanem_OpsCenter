"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { VISIT_STATUS_META, VISIT_STATUSES } from "@/lib/planning/meta";
import type { VisitFormState } from "./actions";

type Action = (state: VisitFormState, formData: FormData) => Promise<VisitFormState>;

export interface VisitDefaults {
  id?: string;
  title?: string;
  description?: string | null;
  typeId?: string;
  clientId?: string | null;
  assigneeId?: string | null;
  location?: string | null;
  scheduledAt?: Date | string | null;
  durationMinutes?: number;
  status?: keyof typeof VISIT_STATUS_META;
  notes?: string | null;
}

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

function toLocalDateTime(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  const p = (n: number) => `${n}`.padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
}

export function VisitForm({
  action,
  types,
  clients,
  technicians,
  defaults,
  submitLabel,
  showStatus,
}: {
  action: Action;
  types: { id: string; name: string }[];
  clients: { id: string; companyName: string }[];
  technicians: { id: string; firstName: string; lastName: string }[];
  defaults?: VisitDefaults;
  submitLabel: string;
  showStatus?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {} as VisitFormState);

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
          <label htmlFor="scheduledAt" className="text-sm text-[var(--muted-foreground)]">Date &amp; time *</label>
          <input id="scheduledAt" name="scheduledAt" type="datetime-local" required defaultValue={toLocalDateTime(defaults?.scheduledAt)} className={inputClass} />
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
          <label htmlFor="location" className="text-sm text-[var(--muted-foreground)]">Location</label>
          <input id="location" name="location" type="text" defaultValue={defaults?.location ?? ""} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="durationMinutes" className="text-sm text-[var(--muted-foreground)]">Duration (minutes)</label>
          <input id="durationMinutes" name="durationMinutes" type="number" min={0} defaultValue={defaults?.durationMinutes ?? 60} className={inputClass} />
        </div>

        {showStatus ? (
          <div className="flex flex-col gap-1">
            <label htmlFor="status" className="text-sm text-[var(--muted-foreground)]">Status</label>
            <select id="status" name="status" defaultValue={defaults?.status ?? "SCHEDULED"} className={inputClass}>
              {VISIT_STATUSES.map((s) => (
                <option key={s} value={s}>{VISIT_STATUS_META[s].label}</option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm text-[var(--muted-foreground)]">Description</label>
        <textarea id="description" name="description" rows={3} defaultValue={defaults?.description ?? ""} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm text-[var(--muted-foreground)]">Notes</label>
        <textarea id="notes" name="notes" rows={3} defaultValue={defaults?.notes ?? ""} className={inputClass} />
      </div>

      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}

      <Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button>
    </form>
  );
}
