"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { importClientsAction, type ClientImportState } from "../actions";

export function ImportForm() {
  const [state, formAction, pending] = useActionState(importClientsAction, {} as ClientImportState);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="file" className="text-sm text-[var(--muted-foreground)]">CSV file</label>
          <input
            id="file"
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            className="text-sm file:mr-3 file:rounded-[var(--radius)] file:border-0 file:bg-[var(--muted)] file:px-3 file:py-1.5 file:text-sm"
          />
        </div>
        {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
        <Button type="submit" disabled={pending}>{pending ? "Importing…" : "Import"}</Button>
      </form>

      {state.imported != null ? (
        <div className="rounded-[var(--radius)] border border-[#10b98155] bg-[#10b9811a] p-4 text-sm">
          <p className="font-medium text-[#10b981]">Imported {state.imported} client{state.imported === 1 ? "" : "s"}.</p>
          <Link href="/clients" className="mt-1 inline-block text-[var(--muted-foreground)] hover:underline">Back to clients →</Link>
        </div>
      ) : null}

      {state.errors && state.errors.length > 0 ? (
        <div className="rounded-[var(--radius)] border border-[var(--border)] p-4 text-sm">
          <p className="mb-2 font-medium text-[#f59e0b]">{state.errors.length} row{state.errors.length === 1 ? "" : "s"} skipped:</p>
          <ul className="space-y-1 text-[var(--muted-foreground)]">
            {state.errors.map((e, i) => (
              <li key={i}>Line {e.line}: {e.message}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
