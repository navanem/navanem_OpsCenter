"use client";

import { useActionState } from "react";
import { updateSubscriptionSettingsAction, type SubscriptionSettingsState } from "./actions";
import { Button } from "@/components/ui/button";

export function SubscriptionSettingsForm({ enabled }: { enabled: boolean }) {
  const [state, formAction, pending] = useActionState<SubscriptionSettingsState, FormData>(
    updateSubscriptionSettingsAction,
    {},
  );
  return (
    <form action={formAction} className="space-y-6">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="subscriptionsEnabled" value="true" defaultChecked={enabled} className="h-4 w-4 cursor-pointer" />
        Enable subscription management
      </label>
      <p className="-mt-4 text-xs text-[var(--muted-foreground)]">
        Track recurring subscriptions, renewals, warranties and support plans per client — with type, status, cost, billing cycle, renewal date and coverage end. When disabled, the module is hidden everywhere.
      </p>
      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-green-600">Saved.</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
    </form>
  );
}
