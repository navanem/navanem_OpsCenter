"use client";

import { useActionState } from "react";
import { addPortalCommentAction, type PortalTicketState } from "../../actions";
import { Button } from "@/components/ui/button";

export function PortalCommentForm({ ticketId }: { ticketId: string }) {
  const [state, formAction, pending] = useActionState<PortalTicketState, FormData>(addPortalCommentAction, {});
  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="ticketId" value={ticketId} />
      <textarea
        name="body"
        required
        rows={3}
        placeholder="Add a reply…"
        className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      />
      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Sending…" : "Send reply"}</Button>
    </form>
  );
}
