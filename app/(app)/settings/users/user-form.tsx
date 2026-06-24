"use client";

import { useActionState } from "react";
import { updateUserAction } from "./actions";
import type { UserFormState } from "./actions";
import { Button } from "@/components/ui/button";

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

export interface UserDefaults {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  roleId: string;
}

export function UserForm({
  defaults,
  roles,
}: {
  defaults: UserDefaults;
  roles: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<UserFormState, FormData>(
    updateUserAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={defaults.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="email" className="text-sm text-[var(--muted-foreground)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            disabled
            value={defaults.email}
            className={`${inputClass} cursor-not-allowed opacity-60`}
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
            defaultValue={defaults.firstName}
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
            defaultValue={defaults.lastName}
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
            defaultValue={defaults.phone ?? ""}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="roleId" className="text-sm text-[var(--muted-foreground)]">
            Role *
          </label>
          <select
            id="roleId"
            name="roleId"
            required
            defaultValue={defaults.roleId}
            className={inputClass}
          >
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
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
