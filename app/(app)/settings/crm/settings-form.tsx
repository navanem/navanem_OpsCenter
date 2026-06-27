"use client";

import { useActionState } from "react";
import { updateCrmSettingsAction, type CrmSettingsState } from "./actions";
import { Button } from "@/components/ui/button";

export function CrmSettingsForm({ enabled }: { enabled: boolean }) {
  const [state, formAction, pending] = useActionState<CrmSettingsState, FormData>(
    updateCrmSettingsAction,
    {},
  );
  return (
    <form action={formAction} className="space-y-6">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="crmEnabled" value="true" defaultChecked={enabled} className="h-4 w-4 cursor-pointer" />
        Enable CRM (sales pipeline)
      </label>
      <p className="-mt-4 text-xs text-[var(--muted-foreground)]">
        Track sales leads (LEAD-####) and opportunities (OPP-####) through a configurable pipeline with stages, value, probability, owner and expected close date. Convert qualified leads into clients in one click. When disabled, the module is hidden everywhere.
      </p>
      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-green-600">Saved.</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
    </form>
  );
}
