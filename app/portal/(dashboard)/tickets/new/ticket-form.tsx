"use client";

import { useActionState } from "react";
import { createPortalTicketAction, type PortalTicketState } from "../../actions";
import { Button } from "@/components/ui/button";

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

export function PortalTicketForm({ priorities }: { priorities: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState<PortalTicketState, FormData>(createPortalTicketAction, {});
  const defaultPriority = priorities.find((p) => p.name === "Medium")?.id ?? priorities[0]?.id ?? "";

  return (
    <form action={formAction} className="space-y-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="subject" className="text-sm text-[var(--muted-foreground)]">Subject *</label>
        <input id="subject" name="subject" type="text" required className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm text-[var(--muted-foreground)]">Description *</label>
        <textarea id="description" name="description" required rows={5} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="priorityId" className="text-sm text-[var(--muted-foreground)]">Priority</label>
        <select id="priorityId" name="priorityId" defaultValue={defaultPriority} className={inputClass}>
          {priorities.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Submitting…" : "Submit ticket"}</Button>
    </form>
  );
}
