"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";
import type { ReleaseFormState } from "./actions";

type Action = (state: ReleaseFormState, formData: FormData) => Promise<ReleaseFormState>;

export interface ReleaseDefaults {
  id?: string;
  name?: string;
  version?: string | null;
  description?: string | null;
  typeId?: string | null;
  statusId?: string;
  clientId?: string | null;
  ownerId?: string | null;
  plannedDate?: Date | string | null;
  releasedDate?: Date | string | null;
  releaseNotes?: string | null;
  rollbackPlan?: string | null;
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

export function ReleaseForm({
  action,
  clients,
  owners,
  types,
  statuses,
  defaults,
}: {
  action: Action;
  clients: { id: string; companyName: string }[];
  owners: { id: string; firstName: string; lastName: string }[];
  types: { id: string; name: string }[];
  statuses: { id: string; name: string }[];
  defaults?: ReleaseDefaults;
}) {
  const [state, formAction, pending] = useActionState(action, {} as ReleaseFormState);
  const t = useT();

  return (
    <form action={formAction} className="space-y-6">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm text-[var(--muted-foreground)]">{t.common.name} *</label>
          <input id="name" name="name" type="text" required defaultValue={defaults?.name ?? ""} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="version" className="text-sm text-[var(--muted-foreground)]">{t.releases.version}</label>
          <input id="version" name="version" type="text" defaultValue={defaults?.version ?? ""} placeholder="v1.2.0" className={inputClass} />
        </div>
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
          <label htmlFor="ownerId" className="text-sm text-[var(--muted-foreground)]">{t.releases.owner}</label>
          <select id="ownerId" name="ownerId" defaultValue={defaults?.ownerId ?? ""} className={inputClass}>
            <option value="">{t.common.unassigned}</option>
            {owners.map((o) => <option key={o.id} value={o.id}>{o.firstName} {o.lastName}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="plannedDate" className="text-sm text-[var(--muted-foreground)]">{t.releases.plannedDate}</label>
          <input id="plannedDate" name="plannedDate" type="date" defaultValue={toDate(defaults?.plannedDate)} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="releasedDate" className="text-sm text-[var(--muted-foreground)]">{t.releases.releasedDate}</label>
          <input id="releasedDate" name="releasedDate" type="date" defaultValue={toDate(defaults?.releasedDate)} className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm text-[var(--muted-foreground)]">{t.common.description}</label>
        <textarea id="description" name="description" rows={3} defaultValue={defaults?.description ?? ""} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="releaseNotes" className="text-sm text-[var(--muted-foreground)]">{t.releases.releaseNotes}</label>
        <textarea id="releaseNotes" name="releaseNotes" rows={4} defaultValue={defaults?.releaseNotes ?? ""} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="rollbackPlan" className="text-sm text-[var(--muted-foreground)]">{t.releases.rollbackPlan}</label>
        <textarea id="rollbackPlan" name="rollbackPlan" rows={3} defaultValue={defaults?.rollbackPlan ?? ""} className={inputClass} />
      </div>

      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? t.common.saving : defaults?.id ? t.common.save : t.common.create}</Button>
    </form>
  );
}
