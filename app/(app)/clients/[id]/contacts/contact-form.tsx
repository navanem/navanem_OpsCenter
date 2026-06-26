"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { ContactFormState } from "./actions";

type Action = (state: ContactFormState, formData: FormData) => Promise<ContactFormState>;

export interface ContactDefaults {
  id?: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string | null;
  email?: string | null;
  phone?: string | null;
  isVip?: boolean;
  hasPhoto?: boolean;
  portalCanCreate?: boolean;
  portalCanComment?: boolean;
}

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm text-[var(--muted-foreground)]">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        className={inputClass}
      />
    </div>
  );
}

export function ContactForm({
  action,
  clientId,
  defaults,
  submitLabel,
}: {
  action: Action;
  clientId: string;
  defaults?: ContactDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as ContactFormState);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="clientId" value={clientId} />
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" name="firstName" defaultValue={defaults?.firstName} required />
        <Field label="Last name" name="lastName" defaultValue={defaults?.lastName} required />
        <Field label="Job title" name="jobTitle" defaultValue={defaults?.jobTitle} />
        <Field label="Email" name="email" type="email" defaultValue={defaults?.email} />
        <Field label="Phone" name="phone" defaultValue={defaults?.phone} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input
            id="isVip"
            name="isVip"
            type="checkbox"
            defaultChecked={defaults?.isVip ?? false}
            className="h-4 w-4 rounded border-[var(--border)] accent-[var(--primary)]"
          />
          <label htmlFor="isVip" className="text-sm text-[var(--muted-foreground)]">
            VIP contact
          </label>
        </div>

        <div className="flex flex-col gap-2 rounded-[var(--radius)] border border-[var(--border)] p-3">
          <span className="text-sm font-medium">Portal capabilities</span>
          <p className="text-xs text-[var(--muted-foreground)]">Apply when this contact has portal access (granted from the client page).</p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="portalCanCreate" value="true" defaultChecked={defaults?.portalCanCreate ?? true} className="h-4 w-4 accent-[var(--primary)]" />
            Can create tickets
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="portalCanComment" value="true" defaultChecked={defaults?.portalCanComment ?? true} className="h-4 w-4 accent-[var(--primary)]" />
            Can reply on tickets
          </label>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="photo" className="text-sm text-[var(--muted-foreground)]">
            Photo
          </label>
          {defaults?.hasPhoto && defaults.id ? (
            <div className="mb-2">
              <img
                src={`/api/contacts/${defaults.id}/photo`}
                alt="Current photo"
                className="h-12 w-12 rounded-full object-cover"
              />
            </div>
          ) : null}
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="text-sm text-[var(--muted-foreground)] file:mr-3 file:rounded-[var(--radius)] file:border file:border-[var(--border)] file:bg-[var(--muted)] file:px-3 file:py-1 file:text-sm file:text-[var(--foreground)]"
          />
        </div>
      </div>

      {state.error ? (
        <p className="text-sm text-[var(--destructive)]">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
