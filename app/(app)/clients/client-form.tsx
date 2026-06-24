"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { ClientFormState } from "./actions";

type Action = (state: ClientFormState, formData: FormData) => Promise<ClientFormState>;

export interface ClientDefaults {
  id?: string;
  companyName?: string;
  domain?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  status?: "ACTIVE" | "INACTIVE";
  assignedTechnicianId?: string | null;
  notes?: string | null;
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

export function ClientForm({
  action,
  technicians,
  defaults,
  submitLabel,
}: {
  action: Action;
  technicians: { id: string; firstName: string; lastName: string }[];
  defaults?: ClientDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as ClientFormState);

  return (
    <form action={formAction} className="space-y-6">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company name" name="companyName" defaultValue={defaults?.companyName} required />
        <Field label="Domain" name="domain" defaultValue={defaults?.domain} />
        <Field label="Contact name" name="contactName" defaultValue={defaults?.contactName} />
        <Field label="Contact email" name="contactEmail" type="email" defaultValue={defaults?.contactEmail} />
        <Field label="Contact phone" name="contactPhone" defaultValue={defaults?.contactPhone} />
        <Field label="Address" name="address" defaultValue={defaults?.address} />
        <Field label="City" name="city" defaultValue={defaults?.city} />
        <Field label="Postal code" name="postalCode" defaultValue={defaults?.postalCode} />
        <Field label="Country" name="country" defaultValue={defaults?.country} />

        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-sm text-[var(--muted-foreground)]">Status</label>
          <select id="status" name="status" defaultValue={defaults?.status ?? "ACTIVE"} className={inputClass}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="assignedTechnicianId" className="text-sm text-[var(--muted-foreground)]">Assigned technician</label>
          <select
            id="assignedTechnicianId"
            name="assignedTechnicianId"
            defaultValue={defaults?.assignedTechnicianId ?? ""}
            className={inputClass}
          >
            <option value="">Unassigned</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.firstName} {t.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-sm text-[var(--muted-foreground)]">Notes</label>
        <textarea id="notes" name="notes" rows={4} defaultValue={defaults?.notes ?? ""} className={inputClass} />
      </div>

      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
