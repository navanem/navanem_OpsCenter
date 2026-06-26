"use client";

import Link from "next/link";
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

  if (state.codes && state.codes.length > 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium">Save your backup codes</p>
        <p className="text-xs text-[var(--muted-foreground)]">
          Each code works once if you lose access to your authenticator. They won&apos;t be shown again.
        </p>
        <ul className="grid grid-cols-2 gap-1.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] p-3 font-mono text-sm">
          {state.codes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <Link href="/settings/security" className="inline-block text-sm text-[var(--primary)] hover:underline">
          I&apos;ve saved them — done
        </Link>
      </div>
    );
  }

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
