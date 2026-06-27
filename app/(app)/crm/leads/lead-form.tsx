"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";
import type { LeadFormState } from "./actions";

type Action = (state: LeadFormState, formData: FormData) => Promise<LeadFormState>;

export interface LeadDefaults {
  id?: string;
  companyName?: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  sourceId?: string | null;
  statusId?: string | null;
  ownerId?: string | null;
  estimatedValueCents?: number | null;
  notes?: string | null;
}

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

export function LeadForm({
  action,
  owners,
  sources,
  statuses,
  defaults,
}: {
  action: Action;
  owners: { id: string; firstName: string; lastName: string }[];
  sources: { id: string; name: string }[];
  statuses: { id: string; name: string }[];
  defaults?: LeadDefaults;
}) {
  const [state, formAction, pending] = useActionState(action, {} as LeadFormState);
  const t = useT();

  return (
    <form action={formAction} className="space-y-6">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="companyName" className="text-sm text-[var(--muted-foreground)]">{t.crm.company} *</label>
          <input id="companyName" name="companyName" type="text" required defaultValue={defaults?.companyName ?? ""} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="contactName" className="text-sm text-[var(--muted-foreground)]">{t.crm.contact}</label>
          <input id="contactName" name="contactName" type="text" defaultValue={defaults?.contactName ?? ""} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm text-[var(--muted-foreground)]">{t.common.email}</label>
          <input id="email" name="email" type="email" defaultValue={defaults?.email ?? ""} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="phone" className="text-sm text-[var(--muted-foreground)]">{t.common.phone}</label>
          <input id="phone" name="phone" type="text" defaultValue={defaults?.phone ?? ""} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="sourceId" className="text-sm text-[var(--muted-foreground)]">{t.crm.source}</label>
          <select id="sourceId" name="sourceId" defaultValue={defaults?.sourceId ?? ""} className={inputClass}>
            <option value="">{t.common.none}</option>
            {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="statusId" className="text-sm text-[var(--muted-foreground)]">{t.common.status}</label>
          <select id="statusId" name="statusId" defaultValue={defaults?.statusId ?? ""} className={inputClass}>
            <option value="">{t.common.none}</option>
            {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="ownerId" className="text-sm text-[var(--muted-foreground)]">{t.crm.owner}</label>
          <select id="ownerId" name="ownerId" defaultValue={defaults?.ownerId ?? ""} className={inputClass}>
            <option value="">{t.common.unassigned}</option>
            {owners.map((o) => <option key={o.id} value={o.id}>{o.firstName} {o.lastName}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="estimatedValue" className="text-sm text-[var(--muted-foreground)]">{t.crm.estimatedValue}</label>
          <input id="estimatedValue" name="estimatedValue" type="text" inputMode="decimal" defaultValue={defaults?.estimatedValueCents != null ? (defaults.estimatedValueCents / 100).toFixed(2) : ""} className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm text-[var(--muted-foreground)]">{t.common.notes}</label>
        <textarea id="notes" name="notes" rows={3} defaultValue={defaults?.notes ?? ""} className={inputClass} />
      </div>

      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? t.common.saving : defaults?.id ? t.common.save : t.common.create}</Button>
    </form>
  );
}
