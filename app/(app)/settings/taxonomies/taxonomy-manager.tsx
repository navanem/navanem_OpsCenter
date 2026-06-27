"use client";

import { useActionState } from "react";
import { saveTaxonomyAction, deleteTaxonomyAction } from "./actions";
import type { TaxonomyState } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Kind = "category" | "priority" | "industry" | "project-status" | "task-status" | "visit-type" | "contract-status" | "tag" | "knowledge-category" | "device-type" | "device-status" | "subscription-type" | "subscription-status" | "ticket-type";

interface TaxonomyItem {
  id: string;
  name: string;
  color?: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface TaxonomyManagerProps {
  kind: Kind;
  title: string;
  items: TaxonomyItem[];
}

const inputClass =
  "rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--card)] px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";
const colorClass =
  "h-8 w-8 shrink-0 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)] bg-transparent p-0.5";
const btnClass =
  "rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--muted)] disabled:opacity-50";

// color | name | order | active | save | delete
function gridCols(hasColor: boolean) {
  return hasColor
    ? "grid grid-cols-[2rem_minmax(0,1fr)_4rem_3rem_auto_2rem] items-center gap-2.5"
    : "grid grid-cols-[minmax(0,1fr)_4rem_3rem_auto_2rem] items-center gap-2.5";
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

function ItemRow({ item, kind }: { item: TaxonomyItem; kind: Kind }) {
  const [state, action, pending] = useActionState<TaxonomyState, FormData>(saveTaxonomyAction, {});
  const hasColor = kind !== "industry";

  return (
    <li className={`${gridCols(hasColor)} px-3 py-2 transition-colors hover:bg-[var(--muted)]/40`}>
      <form action={action} className="contents">
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={item.id} />
        {hasColor ? (
          <input type="color" name="color" defaultValue={item.color ?? "#3b82f6"} className={colorClass} aria-label="Color" />
        ) : null}
        <input type="text" name="name" required defaultValue={item.name} className={`${inputClass} min-w-0`} aria-label="Name" />
        <input type="number" name="sortOrder" defaultValue={item.sortOrder} min={0} className={`${inputClass} w-full text-center`} aria-label="Order" />
        <label className="flex justify-center">
          <input type="checkbox" name="isActive" defaultChecked={item.isActive} value="true" className="h-4 w-4 cursor-pointer" style={{ accentColor: "var(--primary)" }} aria-label="Active" />
        </label>
        <button type="submit" className={btnClass} disabled={pending}>{pending ? "…" : "Save"}</button>
      </form>
      <form
        action={deleteTaxonomyAction}
        className="contents"
        onSubmit={(e) => {
          if (!confirm(`Delete "${item.name}"? If it is in use, deactivate it instead.`)) e.preventDefault();
        }}
      >
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={item.id} />
        <button type="submit" aria-label="Delete" title="Delete" className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--muted-foreground)] transition-colors hover:bg-[var(--destructive)]/15 hover:text-[var(--destructive)]">
          <TrashIcon />
        </button>
      </form>
      {state.error ? <p className="col-span-full pt-1 text-xs text-[var(--destructive)]">{state.error}</p> : null}
    </li>
  );
}

function AddForm({ kind }: { kind: Kind }) {
  const [state, action, pending] = useActionState<TaxonomyState, FormData>(saveTaxonomyAction, {});
  const hasColor = kind !== "industry";

  return (
    <form action={action} className={`${gridCols(hasColor)} rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--muted)]/30 px-3 py-2.5`}>
      <input type="hidden" name="kind" value={kind} />
      {hasColor ? <input type="color" name="color" defaultValue="#3b82f6" className={colorClass} aria-label="Color" /> : null}
      <input type="text" name="name" required placeholder="New item…" className={`${inputClass} min-w-0`} aria-label="Name" />
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

function ColumnHeader({ hasColor }: { hasColor: boolean }) {
  return (
    <div className={`${gridCols(hasColor)} px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]`}>
      {hasColor ? <span /> : null}
      <span>Name</span>
      <span className="text-center">Order</span>
      <span className="text-center">Active</span>
      <span />
      <span />
    </div>
  );
}

export function TaxonomyManager({ kind, title, items }: TaxonomyManagerProps) {
  const hasColor = kind !== "industry";
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No items yet.</p>
        ) : (
          <div>
            <ColumnHeader hasColor={hasColor} />
            <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-[var(--radius)] border border-[var(--border)]">
              {items.map((item) => (
                <ItemRow key={item.id} item={item} kind={kind} />
              ))}
            </ul>
          </div>
        )}

        <AddForm kind={kind} />

        <p className="text-xs text-[var(--muted-foreground)]">
          Items in use cannot be deleted — deactivate them instead.
        </p>
      </CardContent>
    </Card>
  );
}
