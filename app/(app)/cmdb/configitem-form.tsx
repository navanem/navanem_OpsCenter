"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";
import type { ConfigItemFormState } from "./actions";

type Action = (state: ConfigItemFormState, formData: FormData) => Promise<ConfigItemFormState>;

export interface ConfigItemDefaults {
  id?: string;
  name?: string;
  typeId?: string | null;
  statusId?: string | null;
  clientId?: string | null;
  deviceId?: string | null;
  environment?: string | null;
  location?: string | null;
  owner?: string | null;
  description?: string | null;
  relatedIds?: string[];
}

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

export function ConfigItemForm({
  action,
  clients,
  devices,
  types,
  statuses,
  relatedOptions,
  defaults,
}: {
  action: Action;
  clients: { id: string; companyName: string }[];
  devices: { id: string; name: string }[];
  types: { id: string; name: string }[];
  statuses: { id: string; name: string }[];
  relatedOptions: { id: string; number: number; name: string }[];
  defaults?: ConfigItemDefaults;
}) {
  const [state, formAction, pending] = useActionState(action, {} as ConfigItemFormState);
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
          <label htmlFor="typeId" className="text-sm text-[var(--muted-foreground)]">{t.common.type}</label>
          <select id="typeId" name="typeId" defaultValue={defaults?.typeId ?? ""} className={inputClass}>
            <option value="">{t.common.none}</option>
            {types.map((ty) => <option key={ty.id} value={ty.id}>{ty.name}</option>)}
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
          <label htmlFor="clientId" className="text-sm text-[var(--muted-foreground)]">{t.common.client}</label>
          <select id="clientId" name="clientId" defaultValue={defaults?.clientId ?? ""} className={inputClass}>
            <option value="">{t.form.unassignedInternal}</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="deviceId" className="text-sm text-[var(--muted-foreground)]">{t.cmdb.device}</label>
          <select id="deviceId" name="deviceId" defaultValue={defaults?.deviceId ?? ""} className={inputClass}>
            <option value="">{t.common.none}</option>
            {devices.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="environment" className="text-sm text-[var(--muted-foreground)]">{t.cmdb.environment}</label>
          <input id="environment" name="environment" type="text" defaultValue={defaults?.environment ?? ""} placeholder={t.cmdb.environmentHint} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="location" className="text-sm text-[var(--muted-foreground)]">{t.cmdb.location}</label>
          <input id="location" name="location" type="text" defaultValue={defaults?.location ?? ""} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="owner" className="text-sm text-[var(--muted-foreground)]">{t.cmdb.owner}</label>
          <input id="owner" name="owner" type="text" defaultValue={defaults?.owner ?? ""} className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm text-[var(--muted-foreground)]">{t.common.description}</label>
        <textarea id="description" name="description" rows={3} defaultValue={defaults?.description ?? ""} className={inputClass} />
      </div>

      {relatedOptions.length > 0 ? (
        <div className="flex flex-col gap-1">
          <label htmlFor="relatedTo" className="text-sm text-[var(--muted-foreground)]">{t.cmdb.related}</label>
          <select id="relatedTo" name="relatedTo" multiple defaultValue={defaults?.relatedIds ?? []} className={`${inputClass} h-40`}>
            {relatedOptions.map((o) => (
              <option key={o.id} value={o.id}>
                CI-{1000 + o.number} — {o.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-[var(--muted-foreground)]">{t.cmdb.relatedHint}</p>
        </div>
      ) : null}

      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? t.common.saving : defaults?.id ? t.common.save : t.common.create}</Button>
    </form>
  );
}
