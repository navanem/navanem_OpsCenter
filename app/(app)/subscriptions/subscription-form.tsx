"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { SubscriptionFormState } from "./actions";

type Action = (state: SubscriptionFormState, formData: FormData) => Promise<SubscriptionFormState>;

type Cycle = "MONTHLY" | "QUARTERLY" | "YEARLY" | "ONE_OFF";

export interface SubscriptionDefaults {
  id?: string;
  name?: string;
  typeId?: string;
  statusId?: string;
  clientId?: string | null;
  provider?: string | null;
  reference?: string | null;
  costCents?: number | null;
  billingCycle?: Cycle;
  seats?: number | null;
  startDate?: Date | string | null;
  renewalDate?: Date | string | null;
  autoRenew?: boolean;
  supportLevel?: string | null;
  warrantyEnd?: Date | string | null;
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
function toMoney(cents: number | null | undefined): string {
  return cents != null ? (cents / 100).toFixed(2) : "";
}

const CYCLES: { value: Cycle; label: string }[] = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "YEARLY", label: "Yearly" },
  { value: "ONE_OFF", label: "One-off" },
];

export function SubscriptionForm({
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
  defaults?: SubscriptionDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as SubscriptionFormState);

  return (
    <form action={formAction} className="space-y-6">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="name" className="text-sm text-[var(--muted-foreground)]">Name *</label>
          <input id="name" name="name" type="text" required defaultValue={defaults?.name ?? ""} placeholder="e.g. Microsoft 365 E3" className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="typeId" className="text-sm text-[var(--muted-foreground)]">Type *</label>
          <select id="typeId" name="typeId" required defaultValue={defaults?.typeId ?? ""} className={inputClass}>
            <option value="" disabled>Select a type</option>
            {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="statusId" className="text-sm text-[var(--muted-foreground)]">Status *</label>
          <select id="statusId" name="statusId" required defaultValue={defaults?.statusId ?? ""} className={inputClass}>
            <option value="" disabled>Select a status</option>
            {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="clientId" className="text-sm text-[var(--muted-foreground)]">Client</label>
          <select id="clientId" name="clientId" defaultValue={defaults?.clientId ?? ""} className={inputClass}>
            <option value="">Unassigned / internal</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="provider" className="text-sm text-[var(--muted-foreground)]">Provider / vendor</label>
          <input id="provider" name="provider" type="text" defaultValue={defaults?.provider ?? ""} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="reference" className="text-sm text-[var(--muted-foreground)]">Reference / account</label>
          <input id="reference" name="reference" type="text" defaultValue={defaults?.reference ?? ""} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="cost" className="text-sm text-[var(--muted-foreground)]">Cost (per cycle)</label>
          <input id="cost" name="cost" type="text" inputMode="decimal" defaultValue={toMoney(defaults?.costCents)} placeholder="e.g. 120.00" className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="billingCycle" className="text-sm text-[var(--muted-foreground)]">Billing cycle</label>
          <select id="billingCycle" name="billingCycle" defaultValue={defaults?.billingCycle ?? "MONTHLY"} className={inputClass}>
            {CYCLES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="seats" className="text-sm text-[var(--muted-foreground)]">Seats / quantity</label>
          <input id="seats" name="seats" type="number" min={0} defaultValue={defaults?.seats ?? ""} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="supportLevel" className="text-sm text-[var(--muted-foreground)]">Support level</label>
          <input id="supportLevel" name="supportLevel" type="text" defaultValue={defaults?.supportLevel ?? ""} placeholder="e.g. Premier, 24/7" className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="startDate" className="text-sm text-[var(--muted-foreground)]">Start date</label>
          <input id="startDate" name="startDate" type="date" defaultValue={toDateString(defaults?.startDate)} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="renewalDate" className="text-sm text-[var(--muted-foreground)]">Renewal date</label>
          <input id="renewalDate" name="renewalDate" type="date" defaultValue={toDateString(defaults?.renewalDate)} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="warrantyEnd" className="text-sm text-[var(--muted-foreground)]">Warranty / coverage end</label>
          <input id="warrantyEnd" name="warrantyEnd" type="date" defaultValue={toDateString(defaults?.warrantyEnd)} className={inputClass} />
        </div>

        <label className="flex items-center gap-2 self-end text-sm sm:col-span-2">
          <input type="checkbox" name="autoRenew" value="true" defaultChecked={defaults?.autoRenew ?? false} className="h-4 w-4 cursor-pointer" style={{ accentColor: "var(--primary)" }} />
          Auto-renews
        </label>
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
