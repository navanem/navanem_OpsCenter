"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";
import type { OpportunityFormState } from "./actions";

type Action = (state: OpportunityFormState, formData: FormData) => Promise<OpportunityFormState>;

export interface OpportunityDefaults {
  id?: string;
  name?: string;
  clientId?: string | null;
  stageId?: string | null;
  ownerId?: string | null;
  valueCents?: number | null;
  probability?: number | null;
  outcome?: string | null;
  expectedCloseAt?: Date | string | null;
  notes?: string | null;
}

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

function toDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  const p = (n: number) => `${n}`.padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

export function OpportunityForm({
  action,
  clients,
  owners,
  stages,
  defaults,
}: {
  action: Action;
  clients: { id: string; companyName: string }[];
  owners: { id: string; firstName: string; lastName: string }[];
  stages: { id: string; name: string }[];
  defaults?: OpportunityDefaults;
}) {
  const [state, formAction, pending] = useActionState(action, {} as OpportunityFormState);
  const t = useT();

  return (
    <form action={formAction} className="space-y-6">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm text-[var(--muted-foreground)]">{t.common.name} *</label>
        <input id="name" name="name" type="text" required defaultValue={defaults?.name ?? ""} className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="clientId" className="text-sm text-[var(--muted-foreground)]">{t.common.client}</label>
          <select id="clientId" name="clientId" defaultValue={defaults?.clientId ?? ""} className={inputClass}>
            <option value="">{t.common.none}</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="stageId" className="text-sm text-[var(--muted-foreground)]">{t.crm.stage}</label>
          <select id="stageId" name="stageId" defaultValue={defaults?.stageId ?? ""} className={inputClass}>
            <option value="">{t.common.none}</option>
            {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
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
          <label htmlFor="outcome" className="text-sm text-[var(--muted-foreground)]">{t.crm.outcome}</label>
          <select id="outcome" name="outcome" defaultValue={defaults?.outcome ?? "OPEN"} className={inputClass}>
            <option value="OPEN">{t.crm.outcomeOpen}</option>
            <option value="WON">{t.crm.outcomeWon}</option>
            <option value="LOST">{t.crm.outcomeLost}</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="value" className="text-sm text-[var(--muted-foreground)]">{t.crm.value}</label>
          <input id="value" name="value" type="text" inputMode="decimal" defaultValue={defaults?.valueCents != null ? (defaults.valueCents / 100).toFixed(2) : ""} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="probability" className="text-sm text-[var(--muted-foreground)]">{t.crm.probability}</label>
          <input id="probability" name="probability" type="number" min={0} max={100} defaultValue={defaults?.probability ?? ""} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="expectedCloseAt" className="text-sm text-[var(--muted-foreground)]">{t.crm.expectedClose}</label>
          <input id="expectedCloseAt" name="expectedCloseAt" type="date" defaultValue={toDate(defaults?.expectedCloseAt)} className={inputClass} />
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
