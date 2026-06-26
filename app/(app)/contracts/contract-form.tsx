"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { BILLING_CYCLES } from "@/lib/contracts/meta";
import type { ContractFormState } from "./actions";

type Action = (state: ContractFormState, formData: FormData) => Promise<ContractFormState>;

export interface ContractDefaults {
  id?: string;
  name?: string | null;
  clientId?: string;
  typeId?: string;
  statusId?: string;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  value?: string;
  billingCycle?: string;
  includedHours?: string;
  notes?: string | null;
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

export function ContractForm({
  action,
  clients,
  types,
  statuses,
  defaults,
  submitLabel,
}: {
  action: Action;
  clients: { id: string; companyName: string }[];
  types: { id: string; name: string }[];
  statuses: { id: string; name: string }[];
  defaults?: ContractDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as ContractFormState);

  return (
    <form action={formAction} className="space-y-6">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="name" className="text-sm text-[var(--muted-foreground)]">Name</label>
          <input id="name" name="name" type="text" defaultValue={defaults?.name ?? ""} placeholder="e.g. Support 2026" className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="clientId" className="text-sm text-[var(--muted-foreground)]">Client *</label>
          <select id="clientId" name="clientId" required defaultValue={defaults?.clientId ?? ""} className={inputClass}>
            <option value="" disabled>Select a client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
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
          <label htmlFor="statusId" className="text-sm text-[var(--muted-foreground)]">Status *</label>
          <select id="statusId" name="statusId" required defaultValue={defaults?.statusId ?? ""} className={inputClass}>
            <option value="" disabled>Select a status</option>
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="billingCycle" className="text-sm text-[var(--muted-foreground)]">Billing cycle</label>
          <select id="billingCycle" name="billingCycle" defaultValue={defaults?.billingCycle ?? "MONTHLY"} className={inputClass}>
            {BILLING_CYCLES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="value" className="text-sm text-[var(--muted-foreground)]">Value (per period)</label>
          <input id="value" name="value" type="text" inputMode="decimal" defaultValue={defaults?.value ?? ""} placeholder="e.g. 1200.00" className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="includedHours" className="text-sm text-[var(--muted-foreground)]">Included hours / period</label>
          <input id="includedHours" name="includedHours" type="text" inputMode="decimal" defaultValue={defaults?.includedHours ?? ""} placeholder="e.g. 10" className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="startDate" className="text-sm text-[var(--muted-foreground)]">Start date *</label>
          <input id="startDate" name="startDate" type="date" required defaultValue={toDateString(defaults?.startDate)} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="endDate" className="text-sm text-[var(--muted-foreground)]">End date</label>
          <input id="endDate" name="endDate" type="date" defaultValue={toDateString(defaults?.endDate)} className={inputClass} />
        </div>
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
