"use client";

import { useActionState } from "react";
import { updateChangeSettingsAction, type ChangeSettingsState } from "./actions";
import { Button } from "@/components/ui/button";

export function ChangeSettingsForm({ enabled }: { enabled: boolean }) {
  const [state, formAction, pending] = useActionState<ChangeSettingsState, FormData>(
    updateChangeSettingsAction,
    {},
  );
  return (
    <form action={formAction} className="space-y-6">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="changesEnabled" value="true" defaultChecked={enabled} className="h-4 w-4 cursor-pointer" />
        Enable change management
      </label>
      <p className="-mt-4 text-xs text-[var(--muted-foreground)]">
        Plan, approve and track IT changes (CHG-####) with type, status, risk/impact, planned window, implementation and rollback plans, and an approval workflow. When disabled, the module is hidden everywhere.
      </p>
      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-green-600">Saved.</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
    </form>
  );
}
