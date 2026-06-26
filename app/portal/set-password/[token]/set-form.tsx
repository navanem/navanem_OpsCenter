"use client";

import { useActionState } from "react";
import { portalSetPasswordAction, type PortalSetState } from "./actions";
import { Button } from "@/components/ui/button";

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

export function PortalSetForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<PortalSetState, FormData>(portalSetPasswordAction, {});
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm text-[var(--muted-foreground)]">New password</label>
        <input id="password" name="password" type="password" required autoComplete="new-password" className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="confirmPassword" className="text-sm text-[var(--muted-foreground)]">Confirm password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" required autoComplete="new-password" className={inputClass} />
      </div>
      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Set password"}</Button>
    </form>
  );
}
