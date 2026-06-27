"use client";

import { useActionState } from "react";
import { updateReleaseSettingsAction, type ReleaseSettingsState } from "./actions";
import { Button } from "@/components/ui/button";

export function ReleaseSettingsForm({ enabled }: { enabled: boolean }) {
  const [state, formAction, pending] = useActionState<ReleaseSettingsState, FormData>(
    updateReleaseSettingsAction,
    {},
  );
  return (
    <form action={formAction} className="space-y-6">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="releasesEnabled" value="true" defaultChecked={enabled} className="h-4 w-4 cursor-pointer" />
        Enable release management
      </label>
      <p className="-mt-4 text-xs text-[var(--muted-foreground)]">
        Plan and track releases (REL-####) with a version, configurable type and status, owner, client, planned and actual release dates, release notes and a rollback plan. When disabled, the module is hidden everywhere.
      </p>
      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-green-600">Saved.</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
    </form>
  );
}
