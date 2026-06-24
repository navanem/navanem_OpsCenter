"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import type { RoleFormState } from "./actions";

type Action = (state: RoleFormState, formData: FormData) => Promise<RoleFormState>;

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

function groupedPermissions() {
  const groups: Record<string, { key: string; label: string }[]> = {};
  for (const [key, meta] of Object.entries(PERMISSIONS)) {
    (groups[meta.group] ??= []).push({ key, label: meta.label });
  }
  return groups;
}

export function RoleForm({
  action,
  defaults,
  submitLabel,
}: {
  action: Action;
  defaults?: { id?: string; name?: string; description?: string | null; permissionKeys?: string[] };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as RoleFormState);
  const selected = new Set(defaults?.permissionKeys ?? []);
  const groups = groupedPermissions();

  return (
    <form action={formAction} className="space-y-6">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm text-[var(--muted-foreground)]">Name *</label>
        <input id="name" name="name" required defaultValue={defaults?.name ?? ""} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm text-[var(--muted-foreground)]">Description</label>
        <input id="description" name="description" defaultValue={defaults?.description ?? ""} className={inputClass} />
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium">Permissions</p>
        {Object.entries(groups).map(([group, perms]) => (
          <div key={group} className="rounded-[var(--radius)] border border-[var(--border)] p-4">
            <p className="mb-2 text-sm font-medium text-[var(--muted-foreground)]">{group}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {perms.map((p) => (
                <label key={p.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="permissions"
                    value={p.key}
                    defaultChecked={selected.has(p.key)}
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button>
    </form>
  );
}
