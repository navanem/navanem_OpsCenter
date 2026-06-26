"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { DeviceFormState } from "./actions";

type Action = (state: DeviceFormState, formData: FormData) => Promise<DeviceFormState>;

export interface DeviceDefaults {
  id?: string;
  name?: string;
  typeId?: string;
  statusId?: string;
  clientId?: string | null;
  serialNumber?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  hostname?: string | null;
  purchaseDate?: Date | string | null;
  warrantyExpiry?: Date | string | null;
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

export function DeviceForm({
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
  defaults?: DeviceDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as DeviceFormState);

  return (
    <form action={formAction} className="space-y-6">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="name" className="text-sm text-[var(--muted-foreground)]">Name *</label>
          <input id="name" name="name" type="text" required defaultValue={defaults?.name ?? ""} placeholder="e.g. Reception laptop" className={inputClass} />
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
          <label htmlFor="serialNumber" className="text-sm text-[var(--muted-foreground)]">Serial number</label>
          <input id="serialNumber" name="serialNumber" type="text" defaultValue={defaults?.serialNumber ?? ""} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="manufacturer" className="text-sm text-[var(--muted-foreground)]">Manufacturer</label>
          <input id="manufacturer" name="manufacturer" type="text" defaultValue={defaults?.manufacturer ?? ""} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="model" className="text-sm text-[var(--muted-foreground)]">Model</label>
          <input id="model" name="model" type="text" defaultValue={defaults?.model ?? ""} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="hostname" className="text-sm text-[var(--muted-foreground)]">Hostname / IP</label>
          <input id="hostname" name="hostname" type="text" defaultValue={defaults?.hostname ?? ""} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="purchaseDate" className="text-sm text-[var(--muted-foreground)]">Purchase date</label>
          <input id="purchaseDate" name="purchaseDate" type="date" defaultValue={toDateString(defaults?.purchaseDate)} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="warrantyExpiry" className="text-sm text-[var(--muted-foreground)]">Warranty expiry</label>
          <input id="warrantyExpiry" name="warrantyExpiry" type="date" defaultValue={toDateString(defaults?.warrantyExpiry)} className={inputClass} />
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
