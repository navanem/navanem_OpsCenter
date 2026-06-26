"use client";

import { useActionState } from "react";
import { saveContractTypeAction, deleteContractTypeAction, type ContractTypeState } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContractTypeItem {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  defaultHourlyRateCents: number | null;
}

const inputClass =
  "rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";
const colorClass =
  "h-8 w-8 shrink-0 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)] bg-transparent p-0.5";
const btnClass =
  "rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--muted)] disabled:opacity-50";

// color | name | rate | order | active | save | delete
const gridCols = "grid grid-cols-[2rem_minmax(0,1fr)_5rem_4rem_3rem_auto_2rem] items-center gap-2.5";

function rateString(cents: number | null): string {
  return cents != null ? (cents / 100).toFixed(2) : "";
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

function ItemRow({ item }: { item: ContractTypeItem }) {
  const [state, action, pending] = useActionState<ContractTypeState, FormData>(saveContractTypeAction, {});
  return (
    <li className={`${gridCols} px-3 py-2 transition-colors hover:bg-[var(--muted)]/40`}>
      <form action={action} className="contents">
        <input type="hidden" name="id" value={item.id} />
        <input type="color" name="color" defaultValue={item.color} className={colorClass} aria-label="Color" />
        <input type="text" name="name" required defaultValue={item.name} className={`${inputClass} min-w-0`} aria-label="Name" />
        <input type="text" name="defaultHourlyRate" inputMode="decimal" defaultValue={rateString(item.defaultHourlyRateCents)} placeholder="—" className={`${inputClass} w-full text-right`} aria-label="Rate per hour" />
        <input type="number" name="sortOrder" defaultValue={item.sortOrder} min={0} className={`${inputClass} w-full text-center`} aria-label="Order" />
        <label className="flex justify-center">
          <input type="checkbox" name="isActive" defaultChecked={item.isActive} value="true" className="h-4 w-4 cursor-pointer" style={{ accentColor: "var(--primary)" }} aria-label="Active" />
        </label>
        <button type="submit" className={btnClass} disabled={pending}>{pending ? "…" : "Save"}</button>
      </form>
      <form
        action={deleteContractTypeAction}
        className="contents"
        onSubmit={(e) => {
          if (!confirm(`Delete "${item.name}"? If it is in use, deactivate it instead.`)) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={item.id} />
        <button type="submit" aria-label="Delete" title="Delete" className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--muted-foreground)] transition-colors hover:bg-[var(--destructive)]/15 hover:text-[var(--destructive)]">
          <TrashIcon />
        </button>
      </form>
      {state.error ? <p className="col-span-full pt-1 text-xs text-[var(--destructive)]">{state.error}</p> : null}
    </li>
  );
}

function AddForm() {
  const [state, action, pending] = useActionState<ContractTypeState, FormData>(saveContractTypeAction, {});
  return (
    <form action={action} className={`${gridCols} rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2.5`}>
      <input type="color" name="color" defaultValue="#3b82f6" className={colorClass} aria-label="Color" />
      <input type="text" name="name" required placeholder="New type…" className={`${inputClass} min-w-0`} aria-label="Name" />
      <input type="text" name="defaultHourlyRate" inputMode="decimal" placeholder="120" className={`${inputClass} w-full text-right`} aria-label="Rate per hour" />
      <input type="number" name="sortOrder" defaultValue={0} min={0} className={`${inputClass} w-full text-center`} aria-label="Order" />
      <label className="flex justify-center">
        <input type="checkbox" name="isActive" defaultChecked value="true" className="h-4 w-4 cursor-pointer" style={{ accentColor: "var(--primary)" }} aria-label="Active" />
      </label>
      <button type="submit" className="rounded-[var(--radius-sm)] bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90 disabled:opacity-50" disabled={pending}>
        {pending ? "…" : "Add"}
      </button>
      <span />
      {state.error ? <p className="col-span-full pt-1 text-xs text-[var(--destructive)]">{state.error}</p> : null}
    </form>
  );
}

export function ContractTypeManager({ items }: { items: ContractTypeItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contract types</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No contract types yet.</p>
        ) : (
          <div>
            <div className={`${gridCols} px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]`}>
              <span />
              <span>Name</span>
              <span className="text-right">Rate/h</span>
              <span className="text-center">Order</span>
              <span className="text-center">Active</span>
              <span />
              <span />
            </div>
            <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-[var(--radius)] border border-[var(--border)]">
              {items.map((item) => (
                <ItemRow key={item.id} item={item} />
              ))}
            </ul>
          </div>
        )}

        <AddForm />

        <p className="text-xs text-[var(--muted-foreground)]">
          The default hourly rate is inherited by time entries logged for a client on this type of contract. Items in use cannot be deleted — deactivate them instead.
        </p>
      </CardContent>
    </Card>
  );
}
