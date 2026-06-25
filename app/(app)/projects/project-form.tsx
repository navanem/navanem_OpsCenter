"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { ProjectFormState } from "./actions";

type Action = (
  state: ProjectFormState,
  formData: FormData,
) => Promise<ProjectFormState>;

export interface ProjectDefaults {
  id?: string;
  name?: string;
  description?: string | null;
  statusId?: string;
  clientId?: string | null;
  leadId?: string | null;
  startDate?: Date | string | null;
  dueDate?: Date | string | null;
}

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

function toDateString(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function ProjectForm({
  action,
  statuses,
  clients,
  technicians,
  defaults,
  submitLabel,
}: {
  action: Action;
  statuses: { id: string; name: string }[];
  clients: { id: string; companyName: string }[];
  technicians: { id: string; firstName: string; lastName: string }[];
  defaults?: ProjectDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    {} as ProjectFormState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {defaults?.id ? (
        <input type="hidden" name="id" value={defaults.id} />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label
            htmlFor="name"
            className="text-sm text-[var(--muted-foreground)]"
          >
            Project name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={defaults?.name ?? ""}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="statusId"
            className="text-sm text-[var(--muted-foreground)]"
          >
            Status *
          </label>
          <select
            id="statusId"
            name="statusId"
            required
            defaultValue={defaults?.statusId ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Select a status
            </option>
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="clientId"
            className="text-sm text-[var(--muted-foreground)]"
          >
            Client
          </label>
          <select
            id="clientId"
            name="clientId"
            defaultValue={defaults?.clientId ?? ""}
            className={inputClass}
          >
            <option value="">None</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="leadId"
            className="text-sm text-[var(--muted-foreground)]"
          >
            Lead
          </label>
          <select
            id="leadId"
            name="leadId"
            defaultValue={defaults?.leadId ?? ""}
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

        <div className="flex flex-col gap-1">
          <label
            htmlFor="startDate"
            className="text-sm text-[var(--muted-foreground)]"
          >
            Start date
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={toDateString(defaults?.startDate)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="dueDate"
            className="text-sm text-[var(--muted-foreground)]"
          >
            Due date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={toDateString(defaults?.dueDate)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="description"
          className="text-sm text-[var(--muted-foreground)]"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={defaults?.description ?? ""}
          className={inputClass}
        />
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
