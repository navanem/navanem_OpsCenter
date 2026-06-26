"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createTicketAction, type TicketFormState } from "./actions";

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

export interface TicketFormProps {
  clients: { id: string; companyName: string }[];
  technicians: { id: string; firstName: string; lastName: string }[];
  categories: { id: string; name: string }[];
  priorities: { id: string; name: string }[];
}

export function TicketForm({ clients, technicians, categories, priorities }: TicketFormProps) {
  const [state, formAction, pending] = useActionState<TicketFormState, FormData>(
    createTicketAction,
    {},
  );

  const defaultPriorityId =
    priorities.find((p) => p.name === "Medium")?.id ?? priorities[0]?.id ?? "";
  const defaultCategoryId = categories[0]?.id ?? "";

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex flex-col gap-1">
        <label htmlFor="subject" className="text-sm text-[var(--muted-foreground)]">
          Subject *
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm text-[var(--muted-foreground)]">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="clientId" className="text-sm text-[var(--muted-foreground)]">
            Client *
          </label>
          <select id="clientId" name="clientId" required className={inputClass}>
            <option value="">Select a client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="assigneeId" className="text-sm text-[var(--muted-foreground)]">
            Assignee
          </label>
          <select id="assigneeId" name="assigneeId" className={inputClass}>
            <option value="">Unassigned</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.firstName} {t.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="priorityId" className="text-sm text-[var(--muted-foreground)]">
            Priority
          </label>
          <select id="priorityId" name="priorityId" defaultValue={defaultPriorityId} className={inputClass}>
            {priorities.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="categoryId" className="text-sm text-[var(--muted-foreground)]">
            Category
          </label>
          <select id="categoryId" name="categoryId" defaultValue={defaultCategoryId} className={inputClass}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="dueAt" className="text-sm text-[var(--muted-foreground)]">
            Due date
          </label>
          <input id="dueAt" name="dueAt" type="datetime-local" className={inputClass} />
        </div>
      </div>

      {state.error ? (
        <p className="text-sm text-[var(--destructive)]">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create ticket"}
      </Button>
    </form>
  );
}
