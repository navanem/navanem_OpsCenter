"use client";

import { useActionState } from "react";
import { verifyLoginTotpAction, type VerifyState } from "./actions";
import { Button } from "@/components/ui/button";

export function VerifyForm() {
  const [state, formAction, pending] = useActionState<VerifyState, FormData>(verifyLoginTotpAction, {});
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="code" className="text-sm text-[var(--muted-foreground)]">Authentication code</label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          placeholder="123456"
          className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm tracking-widest outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        />
      </div>
      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Verifying…" : "Verify"}</Button>
    </form>
  );
}
