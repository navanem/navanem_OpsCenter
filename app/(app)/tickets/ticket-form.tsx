"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createTicketAction, type TicketFormState } from "./actions";
import {
  TICKET_PRIORITIES,
  TICKET_PRIORITY_META,
  TICKET_CATEGORIES,
  TICKET_CATEGORY_META,
} from "@/lib/tickets/meta";

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

export interface TicketFormProps {
  clients: { id: string; companyName: string }[];
  technicians: { id: string; firstName: string; lastName: string }[];
}

export function TicketForm({ clients, technicians }: TicketFormProps) {
  const [state, formAction, pending] = useActionState<TicketFormState, FormData>(
    createTicketAction,
    {},
  );

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
          <label htmlFor="priority" className="text-sm text-[var(--muted-foreground)]">
            Priority
          </label>
          <select id="priority" name="priority" defaultValue="MEDIUM" className={inputClass}>
            {TICKET_PRIORITIES.map((k) => (
              <option key={k} value={k}>
                {TICKET_PRIORITY_META[k].label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="text-sm text-[var(--muted-foreground)]">
            Category
          </label>
          <select id="category" name="category" defaultValue="OTHER" className={inputClass}>
            {TICKET_CATEGORIES.map((k) => (
              <option key={k} value={k}>
                {TICKET_CATEGORY_META[k].label}
              </option>
            ))}
          </select>
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
