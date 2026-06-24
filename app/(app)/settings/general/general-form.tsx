"use client";

import { useActionState } from "react";
import { updateGeneralAction } from "./actions";
import type { GeneralState } from "./actions";
import { Button } from "@/components/ui/button";

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

interface GeneralFormProps {
  companyName: string;
  hasLogo: boolean;
}

export function GeneralForm({ companyName, hasLogo }: GeneralFormProps) {
  const [state, formAction, pending] = useActionState<GeneralState, FormData>(
    updateGeneralAction,
    {},
  );

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-6">
      <div className="flex flex-col gap-1">
        <label htmlFor="companyName" className="text-sm text-[var(--muted-foreground)]">
          Company name *
        </label>
        <input
          id="companyName"
          name="companyName"
          type="text"
          required
          defaultValue={companyName}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="logo" className="text-sm text-[var(--muted-foreground)]">
          Logo
        </label>
        {hasLogo && (
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/api/logo" alt="Current logo" className="h-10 w-auto" />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Current logo</p>
          </div>
        )}
        <input
          id="logo"
          name="logo"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="text-sm"
        />
        <p className="text-xs text-[var(--muted-foreground)]">
          PNG, JPEG, WebP, or SVG. Max 1 MB.
        </p>
      </div>

      {state.error ? (
        <p className="text-sm text-[var(--destructive)]">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-green-600">Saved.</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
