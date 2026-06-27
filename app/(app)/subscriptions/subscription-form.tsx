"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";
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

const CYCLE_KEYS: Cycle[] = ["MONTHLY", "QUARTERLY", "YEARLY", "ONE_OFF"];

export function SubscriptionForm({
  action,
  clients,
  types,
  statuses,
  defaults,
}: {
  action: Action;
  clients: { id: string; companyName: string }[];
  types: { id: string; name: string }[];
  statuses: { id: string; name: string }[];
  defaults?: SubscriptionDefaults;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as SubscriptionFormState);
  const t = useT();

  return (
    <form action={formAction} className="space-y-6">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="name" className="text-sm text-[var(--muted-foreground)]">{t.common.name} *</label>
          <input id="name" name="name" type="text" required defaultValue={defaults?.name ?? ""} placeholder="e.g. Microsoft 365 E3" className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="typeId" className="text-sm text-[var(--muted-foreground)]">{t.common.type} *</label>
          <select id="typeId" name="typeId" required defaultValue={defaults?.typeId ?? ""} className={inputClass}>
            <option value="" disabled>{t.form.selectType}</option>
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
          <label htmlFor="provider" className="text-sm text-[var(--muted-foreground)]">{t.form.provider}</label>
          <input id="provider" name="provider" type="text" defaultValue={defaults?.provider ?? ""} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="reference" className="text-sm text-[var(--muted-foreground)]">{t.form.reference}</label>
          <input id="reference" name="reference" type="text" defaultValue={defaults?.reference ?? ""} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="cost" className="text-sm text-[var(--muted-foreground)]">{t.form.costPerCycle}</label>
          <input id="cost" name="cost" type="text" inputMode="decimal" defaultValue={toMoney(defaults?.costCents)} placeholder="e.g. 120.00" className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="billingCycle" className="text-sm text-[var(--muted-foreground)]">{t.form.billingCycle}</label>
          <select id="billingCycle" name="billingCycle" defaultValue={defaults?.billingCycle ?? "MONTHLY"} className={inputClass}>
            {CYCLE_KEYS.map((c) => <option key={c} value={c}>{t.billingCycle[c]}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="seats" className="text-sm text-[var(--muted-foreground)]">{t.form.seats}</label>
          <input id="seats" name="seats" type="number" min={0} defaultValue={defaults?.seats ?? ""} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="supportLevel" className="text-sm text-[var(--muted-foreground)]">{t.form.supportLevel}</label>
          <input id="supportLevel" name="supportLevel" type="text" defaultValue={defaults?.supportLevel ?? ""} placeholder="e.g. Premier, 24/7" className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="startDate" className="text-sm text-[var(--muted-foreground)]">{t.form.startDate}</label>
          <input id="startDate" name="startDate" type="date" defaultValue={toDateString(defaults?.startDate)} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="renewalDate" className="text-sm text-[var(--muted-foreground)]">{t.form.renewalDate}</label>
          <input id="renewalDate" name="renewalDate" type="date" defaultValue={toDateString(defaults?.renewalDate)} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="warrantyEnd" className="text-sm text-[var(--muted-foreground)]">{t.form.warrantyEnd}</label>
          <input id="warrantyEnd" name="warrantyEnd" type="date" defaultValue={toDateString(defaults?.warrantyEnd)} className={inputClass} />
        </div>

        <label className="flex items-center gap-2 self-end text-sm sm:col-span-2">
          <input type="checkbox" name="autoRenew" value="true" defaultChecked={defaults?.autoRenew ?? false} className="h-4 w-4 cursor-pointer" style={{ accentColor: "var(--primary)" }} />
          {t.form.autoRenews}
        </label>
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
