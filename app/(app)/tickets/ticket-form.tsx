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
  tags: { id: string; name: string; color: string }[];
}

export function TicketForm({ clients, technicians, categories, priorities, tags }: TicketFormProps) {
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

      {tags.length > 0 ? (
        <div className="flex flex-col gap-2">
          <span className="text-sm text-[var(--muted-foreground)]">Tags</span>
          <div className="flex flex-wrap gap-3">
            {tags.map((t) => (
              <label key={t.id} className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" name="tags" value={t.id} className="h-4 w-4 cursor-pointer" />
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                  {t.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {state.error ? (
        <p className="text-sm text-[var(--destructive)]">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create ticket"}
      </Button>
    </form>
  );
}
