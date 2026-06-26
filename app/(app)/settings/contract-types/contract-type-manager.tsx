"use client";

import { useActionState } from "react";
import { saveContractTypeAction, deleteContractTypeAction, type ContractTypeState } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

interface ContractTypeItem {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  defaultHourlyRateCents: number | null;
}

function rateString(cents: number | null): string {
  return cents != null ? (cents / 100).toFixed(2) : "";
}

function ItemRow({ item }: { item: ContractTypeItem }) {
  const [state, action, pending] = useActionState<ContractTypeState, FormData>(saveContractTypeAction, {});
  return (
    <li className="flex flex-col gap-2 rounded-[var(--radius)] border border-[var(--border)] p-3">
      <div className="flex items-center gap-3">
        <span className="inline-block h-4 w-4 flex-shrink-0 rounded-full border border-[var(--border)]" style={{ backgroundColor: item.color }} />
        <span className="flex-1 text-sm font-medium">{item.name}</span>
        <span className="text-xs text-[var(--muted-foreground)]">
          {item.defaultHourlyRateCents != null ? `${rateString(item.defaultHourlyRateCents)}/h` : "no rate"}
        </span>
        <span className="text-xs text-[var(--muted-foreground)]">#{item.sortOrder}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${item.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
          {item.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <form action={action} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="id" value={item.id} />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--muted-foreground)]">Name</label>
          <input type="text" name="name" required defaultValue={item.name} className={`${inputClass} w-36`} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--muted-foreground)]">Color</label>
          <input type="color" name="color" defaultValue={item.color} className="h-9 w-12 cursor-pointer rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] p-1" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--muted-foreground)]">Rate/h</label>
          <input type="text" name="defaultHourlyRate" inputMode="decimal" defaultValue={rateString(item.defaultHourlyRateCents)} placeholder="—" className={`${inputClass} w-20`} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--muted-foreground)]">Order</label>
          <input type="number" name="sortOrder" defaultValue={item.sortOrder} min={0} className={`${inputClass} w-16`} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--muted-foreground)]">Active</label>
          <div className="flex h-9 items-center">
            <input type="checkbox" name="isActive" defaultChecked={item.isActive} value="true" className="h-4 w-4 cursor-pointer" />
          </div>
        </div>
        <Button type="submit" variant="outline" className="px-3 py-1 text-xs" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </form>

      <form
        action={deleteContractTypeAction}
        onSubmit={(e) => {
          if (!confirm(`Delete "${item.name}"? If it is in use, deactivate it instead.`)) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={item.id} />
        <Button type="submit" variant="outline" className="px-3 py-1 text-xs text-[var(--destructive)] hover:bg-red-50 dark:hover:bg-red-950/20">
          Delete
        </Button>
      </form>

      {state.error ? <p className="text-xs text-[var(--destructive)]">{state.error}</p> : state.ok ? <p className="text-xs text-green-600 dark:text-green-400">Saved.</p> : null}
    </li>
  );
}

function AddForm() {
  const [state, action, pending] = useActionState<ContractTypeState, FormData>(saveContractTypeAction, {});
  return (
    <form action={action} className="flex flex-wrap items-end gap-2 pt-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--muted-foreground)]">Name *</label>
        <input type="text" name="name" required placeholder="New type" className={`${inputClass} w-40`} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--muted-foreground)]">Color</label>
        <input type="color" name="color" defaultValue="#3b82f6" className="h-9 w-12 cursor-pointer rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] p-1" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--muted-foreground)]">Rate/h</label>
        <input type="text" name="defaultHourlyRate" inputMode="decimal" placeholder="e.g. 120" className={`${inputClass} w-20`} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--muted-foreground)]">Order</label>
        <input type="number" name="sortOrder" defaultValue={0} min={0} className={`${inputClass} w-16`} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--muted-foreground)]">Active</label>
        <div className="flex h-9 items-center">
          <input type="checkbox" name="isActive" defaultChecked value="true" className="h-4 w-4 cursor-pointer" />
        </div>
      </div>
      <Button type="submit" className="px-3 py-1 text-xs" disabled={pending}>{pending ? "Adding…" : "Add"}</Button>
      {state.error ? <p className="w-full text-xs text-[var(--destructive)]">{state.error}</p> : state.ok ? <p className="w-full text-xs text-green-600 dark:text-green-400">Saved.</p> : null}
    </form>
  );
}

export function ContractTypeManager({ items }: { items: ContractTypeItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contract types</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">No contract types yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </ul>
        )}
        <p className="text-xs text-[var(--muted-foreground)]">
          The default hourly rate is inherited by time entries logged for a client on this type of contract. Items in use cannot be deleted — deactivate them instead.
        </p>
        <div className="border-t border-[var(--border)] pt-2">
          <p className="mb-2 text-sm font-medium">Add new</p>
          <AddForm />
        </div>
      </CardContent>
    </Card>
  );
}
