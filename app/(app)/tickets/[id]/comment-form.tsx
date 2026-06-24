"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { addCommentAction, type CommentState } from "../actions";

const inputClass =
  "w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

export function CommentForm({ ticketId }: { ticketId: string }) {
  const [state, formAction, pending] = useActionState<CommentState, FormData>(
    addCommentAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-3 pt-4 border-t border-[var(--border)]">
      <input type="hidden" name="ticketId" value={ticketId} />
      <div className="flex flex-col gap-1">
        <label htmlFor="body" className="text-sm font-medium text-[var(--muted-foreground)]">
          Add a comment
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={3}
          className={inputClass}
          placeholder="Write a comment…"
        />
      </div>
      {state.error ? (
        <p className="text-sm text-[var(--destructive)]">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Posting…" : "Add comment"}
      </Button>
    </form>
  );
}
