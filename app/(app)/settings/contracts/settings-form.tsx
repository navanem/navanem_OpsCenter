"use client";

import { useActionState } from "react";
import { updateContractSettingsAction, type ContractSettingsState } from "./actions";
import { Button } from "@/components/ui/button";

export function ContractSettingsForm({ enabled }: { enabled: boolean }) {
  const [state, formAction, pending] = useActionState<ContractSettingsState, FormData>(
    updateContractSettingsAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-6">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="contractsEnabled" value="true" defaultChecked={enabled} className="h-4 w-4 cursor-pointer" />
        Enable contracts
      </label>
      <p className="-mt-4 text-xs text-[var(--muted-foreground)]">
        Track client contracts (support, maintenance, infogérance…) with value, billing cycle, and an included-hours quota. When disabled, the module is hidden everywhere.
      </p>

      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-green-600">Saved.</p> : null}

      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
    </form>
  );
}
