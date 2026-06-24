"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ClientsFilters({
  technicians,
}: {
  technicians: { id: string; firstName: string; lastName: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/clients?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <input
        defaultValue={params.get("search") ?? ""}
        placeholder="Search clients…"
        onKeyDown={(e) => {
          if (e.key === "Enter") update("search", (e.target as HTMLInputElement).value);
        }}
        className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      />
      <select
        defaultValue={params.get("status") ?? ""}
        onChange={(e) => update("status", e.target.value)}
        className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm"
      >
        <option value="">All statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </select>
      <select
        defaultValue={params.get("technicianId") ?? ""}
        onChange={(e) => update("technicianId", e.target.value)}
        className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm"
      >
        <option value="">All technicians</option>
        {technicians.map((t) => (
          <option key={t.id} value={t.id}>
            {t.firstName} {t.lastName}
          </option>
        ))}
      </select>
    </div>
  );
}
