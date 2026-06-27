"use client";

import { useActionState } from "react";
import { updateCmdbSettingsAction, type CmdbSettingsState } from "./actions";
import { Button } from "@/components/ui/button";

export function CmdbSettingsForm({ enabled }: { enabled: boolean }) {
  const [state, formAction, pending] = useActionState<CmdbSettingsState, FormData>(
    updateCmdbSettingsAction,
    {},
  );
  return (
    <form action={formAction} className="space-y-6">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="cmdbEnabled" value="true" defaultChecked={enabled} className="h-4 w-4 cursor-pointer" />
        Enable configuration management (CMDB)
      </label>
      <p className="-mt-4 text-xs text-[var(--muted-foreground)]">
        Track configuration items (CI-####) — servers, applications, services, network gear — with type, status, owner, environment, location, client, linked device and CI-to-CI relationships. When disabled, the module is hidden everywhere.
      </p>
      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-green-600">Saved.</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
    </form>
  );
}
