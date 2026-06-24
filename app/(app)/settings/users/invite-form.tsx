"use client";

import { useActionState, useRef } from "react";
import { inviteUserAction } from "./actions";
import type { InviteState } from "./actions";
import { Button } from "@/components/ui/button";

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

export function InviteForm({ roles }: { roles: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState<InviteState, FormData>(inviteUserAction, {});
  const linkInputRef = useRef<HTMLInputElement>(null);

  if (state.token) {
    const setupLink =
      typeof window !== "undefined"
        ? `${window.location.origin}/invite/${state.token}`
        : `/invite/${state.token}`;

    return (
      <div className="space-y-4">
        <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] p-4">
          <p className="mb-3 text-sm font-medium">User invited successfully.</p>
          {state.emailed ? (
            <p className="mb-3 text-sm text-[var(--muted-foreground)]">
              An invitation email was sent to the user.
            </p>
          ) : null}
          <p className="mb-3 text-sm text-[var(--muted-foreground)]">
            Share this link with the user so they can set their password:
          </p>
          <div className="flex gap-2">
            <input
              ref={linkInputRef}
              type="text"
              readOnly
              value={setupLink}
              className={`${inputClass} flex-1`}
            />
            <Button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(setupLink).catch(() => {
                  if (linkInputRef.current) {
                    linkInputRef.current.select();
                  }
                });
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="email" className="text-sm text-[var(--muted-foreground)]">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="off"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="firstName" className="text-sm text-[var(--muted-foreground)]">
            First name *
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="lastName" className="text-sm text-[var(--muted-foreground)]">
            Last name *
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="phone" className="text-sm text-[var(--muted-foreground)]">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="roleId" className="text-sm text-[var(--muted-foreground)]">
            Role *
          </label>
          <select id="roleId" name="roleId" required className={inputClass}>
            <option value="">Select a role…</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.error ? (
        <p className="text-sm text-[var(--destructive)]">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Sending invite…" : "Send invite"}
      </Button>
    </form>
  );
}
