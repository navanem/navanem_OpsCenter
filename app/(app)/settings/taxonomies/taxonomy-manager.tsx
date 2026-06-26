"use client";

import { useActionState } from "react";
import { saveTaxonomyAction, deleteTaxonomyAction } from "./actions";
import type { TaxonomyState } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

type Kind = "category" | "priority" | "industry" | "project-status" | "task-status" | "visit-type";

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

function ItemRow({ item, kind }: { item: TaxonomyItem; kind: Kind }) {
  const [editState, editAction, editPending] = useActionState<TaxonomyState, FormData>(
    saveTaxonomyAction,
    {},
  );

  return (
    <li className="flex flex-col gap-2 rounded-[var(--radius)] border border-[var(--border)] p-3">
      {/* Row header */}
      <div className="flex items-center gap-3">
        {item.color ? (
          <span
            className="inline-block h-4 w-4 flex-shrink-0 rounded-full border border-[var(--border)]"
            style={{ backgroundColor: item.color }}
          />
        ) : null}
        <span className="flex-1 text-sm font-medium">{item.name}</span>
        <span className="text-xs text-[var(--muted-foreground)]">#{item.sortOrder}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            item.isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-[var(--muted)] text-[var(--muted-foreground)]"
          }`}
        >
          {item.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Inline edit form */}
      <form action={editAction} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={item.id} />

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--muted-foreground)]">Name</label>
          <input
            type="text"
            name="name"
            required
            defaultValue={item.name}
            className={`${inputClass} w-40`}
          />
        </div>

        {kind !== "industry" ? (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--muted-foreground)]">Color</label>
            <input
              type="color"
              name="color"
              defaultValue={item.color ?? "#3b82f6"}
              className="h-9 w-12 cursor-pointer rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] p-1"
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--muted-foreground)]">Order</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={item.sortOrder}
            min={0}
            className={`${inputClass} w-16`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--muted-foreground)]">Active</label>
          <div className="flex h-9 items-center">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={item.isActive}
              value="true"
              className="h-4 w-4 cursor-pointer"
            />
          </div>
        </div>

        <Button type="submit" variant="outline" className="px-3 py-1 text-xs" disabled={editPending}>
          {editPending ? "Saving…" : "Save"}
        </Button>
      </form>

      {/* Delete form — sibling of the edit form, NOT nested inside it */}
      <form
        action={deleteTaxonomyAction}
        onSubmit={(e) => {
          if (!confirm(`Delete "${item.name}"? If it is in use, deactivate it instead.`)) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={item.id} />
        <Button
          type="submit"
          variant="outline"
          className="px-3 py-1 text-xs text-[var(--destructive)] hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          Delete
        </Button>
      </form>

      {editState.error ? (
        <p className="text-xs text-[var(--destructive)]">{editState.error}</p>
      ) : editState.ok ? (
        <p className="text-xs text-green-600 dark:text-green-400">Saved.</p>
      ) : null}
    </li>
  );
}

function AddForm({ kind }: { kind: Kind }) {
  const [state, formAction, pending] = useActionState<TaxonomyState, FormData>(
    saveTaxonomyAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2 pt-4">
      <input type="hidden" name="kind" value={kind} />

      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--muted-foreground)]">Name *</label>
        <input
          type="text"
          name="name"
          required
          placeholder="New item"
          className={`${inputClass} w-44`}
        />
      </div>

      {kind !== "industry" ? (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--muted-foreground)]">Color</label>
          <input
            type="color"
            name="color"
            defaultValue="#3b82f6"
            className="h-9 w-12 cursor-pointer rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] p-1"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--muted-foreground)]">Order</label>
        <input
          type="number"
          name="sortOrder"
          defaultValue={0}
          min={0}
          className={`${inputClass} w-16`}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--muted-foreground)]">Active</label>
        <div className="flex h-9 items-center">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked
            value="true"
            className="h-4 w-4 cursor-pointer"
          />
        </div>
      </div>

      <Button type="submit" className="px-3 py-1 text-xs" disabled={pending}>
        {pending ? "Adding…" : "Add"}
      </Button>

      {state.error ? (
        <p className="w-full text-xs text-[var(--destructive)]">{state.error}</p>
      ) : state.ok ? (
        <p className="w-full text-xs text-green-600 dark:text-green-400">Saved.</p>
      ) : null}
    </form>
  );
}

export function TaxonomyManager({ kind, title, items }: TaxonomyManagerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No items yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <ItemRow key={item.id} item={item} kind={kind} />
            ))}
          </ul>
        )}

        <p className="text-xs text-[var(--muted-foreground)]">
          Items in use cannot be deleted — deactivate them instead.
        </p>

        <div className="border-t border-[var(--border)] pt-2">
          <p className="mb-2 text-sm font-medium">Add new</p>
          <AddForm kind={kind} />
        </div>
      </CardContent>
    </Card>
  );
}
