"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { TotpState } from "./actions";

type Action = (state: TotpState, formData: FormData) => Promise<TotpState>;

export function CodeForm({
  action,
  submitLabel,
  destructive,
}: {
  action: Action;
  submitLabel: string;
  destructive?: boolean;
}) {
  const [state, formAction, pending] = useActionState<TotpState, FormData>(action, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="code" className="text-xs text-[var(--muted-foreground)]">6-digit code</label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          className="w-32 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm tracking-widest outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        />
      </div>
      <Button type="submit" variant={destructive ? "destructive" : "primary"} disabled={pending}>
        {pending ? "Checking…" : submitLabel}
      </Button>
      {state.error ? <p className="w-full text-sm text-[var(--destructive)]">{state.error}</p> : null}
    </form>
  );
}
