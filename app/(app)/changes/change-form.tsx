"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";
import type { ChangeFormState } from "./actions";

type Action = (state: ChangeFormState, formData: FormData) => Promise<ChangeFormState>;

export interface ChangeDefaults {
  id?: string;
  title?: string;
  description?: string | null;
  typeId?: string | null;
  statusId?: string;
  clientId?: string | null;
  assigneeId?: string | null;
  risk?: string | null;
  impact?: string | null;
  plannedStart?: Date | string | null;
  plannedEnd?: Date | string | null;
  implementationPlan?: string | null;
  rollbackPlan?: string | null;
}

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

function toDT(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  const p = (n: number) => `${n}`.padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
}

export function ChangeForm({
  action,
  clients,
  technicians,
  types,
  statuses,
  defaults,
}: {
  action: Action;
  clients: { id: string; companyName: string }[];
  technicians: { id: string; firstName: string; lastName: string }[];
  types: { id: string; name: string }[];
  statuses: { id: string; name: string }[];
  defaults?: ChangeDefaults;
}) {
  const [state, formAction, pending] = useActionState(action, {} as ChangeFormState);
  const t = useT();

  return (
    <form action={formAction} className="space-y-6">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm text-[var(--muted-foreground)]">{t.common.title} *</label>
        <input id="title" name="title" type="text" required defaultValue={defaults?.title ?? ""} className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="typeId" className="text-sm text-[var(--muted-foreground)]">{t.common.type}</label>
          <select id="typeId" name="typeId" defaultValue={defaults?.typeId ?? ""} className={inputClass}>
            <option value="">{t.common.none}</option>
            {types.map((ty) => <option key={ty.id} value={ty.id}>{ty.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="statusId" className="text-sm text-[var(--muted-foreground)]">{t.common.status} *</label>
          <select id="statusId" name="statusId" required defaultValue={defaults?.statusId ?? ""} className={inputClass}>
            <option value="" disabled>{t.form.selectStatus}</option>
            {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="clientId" className="text-sm text-[var(--muted-foreground)]">{t.common.client}</label>
          <select id="clientId" name="clientId" defaultValue={defaults?.clientId ?? ""} className={inputClass}>
            <option value="">{t.form.unassignedInternal}</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="assigneeId" className="text-sm text-[var(--muted-foreground)]">{t.common.assignee}</label>
          <select id="assigneeId" name="assigneeId" defaultValue={defaults?.assigneeId ?? ""} className={inputClass}>
            <option value="">{t.common.unassigned}</option>
            {technicians.map((tech) => <option key={tech.id} value={tech.id}>{tech.firstName} {tech.lastName}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="risk" className="text-sm text-[var(--muted-foreground)]">{t.changes.risk}</label>
          <select id="risk" name="risk" defaultValue={defaults?.risk ?? ""} className={inputClass}>
            <option value="">{t.common.none}</option>
            <option value="LOW">{t.changes.riskLow}</option>
            <option value="MEDIUM">{t.changes.riskMedium}</option>
            <option value="HIGH">{t.changes.riskHigh}</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="impact" className="text-sm text-[var(--muted-foreground)]">{t.changes.impact}</label>
          <input id="impact" name="impact" type="text" defaultValue={defaults?.impact ?? ""} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="plannedStart" className="text-sm text-[var(--muted-foreground)]">{t.changes.plannedStart}</label>
          <input id="plannedStart" name="plannedStart" type="datetime-local" defaultValue={toDT(defaults?.plannedStart)} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="plannedEnd" className="text-sm text-[var(--muted-foreground)]">{t.changes.plannedEnd}</label>
          <input id="plannedEnd" name="plannedEnd" type="datetime-local" defaultValue={toDT(defaults?.plannedEnd)} className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm text-[var(--muted-foreground)]">{t.common.description}</label>
        <textarea id="description" name="description" rows={3} defaultValue={defaults?.description ?? ""} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="implementationPlan" className="text-sm text-[var(--muted-foreground)]">{t.changes.implementationPlan}</label>
        <textarea id="implementationPlan" name="implementationPlan" rows={3} defaultValue={defaults?.implementationPlan ?? ""} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="rollbackPlan" className="text-sm text-[var(--muted-foreground)]">{t.changes.rollbackPlan}</label>
        <textarea id="rollbackPlan" name="rollbackPlan" rows={3} defaultValue={defaults?.rollbackPlan ?? ""} className={inputClass} />
      </div>

      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? t.common.saving : defaults?.id ? t.common.save : t.common.create}</Button>
    </form>
  );
}
