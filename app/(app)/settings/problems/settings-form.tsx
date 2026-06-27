"use client";

import { useActionState } from "react";
import { updateProblemSettingsAction, type ProblemSettingsState } from "./actions";
import { Button } from "@/components/ui/button";

export function ProblemSettingsForm({ enabled }: { enabled: boolean }) {
  const [state, formAction, pending] = useActionState<ProblemSettingsState, FormData>(
    updateProblemSettingsAction,
    {},
  );
  return (
    <form action={formAction} className="space-y-6">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="problemsEnabled" value="true" defaultChecked={enabled} className="h-4 w-4 cursor-pointer" />
        Enable problem management
      </label>
      <p className="-mt-4 text-xs text-[var(--muted-foreground)]">
        Track problems (PRB-####) behind recurring incidents with configurable type and status, priority, impact, root cause, workaround, a known-error flag and resolution. When disabled, the module is hidden everywhere.
      </p>
      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-green-600">Saved.</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
    </form>
  );
}
