"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function TicketsFilters({
  clients,
  technicians,
  priorities,
  categories,
}: {
  clients: { id: string; companyName: string }[];
  technicians: { id: string; firstName: string; lastName: string }[];
  priorities: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/tickets?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="search"
        defaultValue={params.get("search") ?? ""}
        placeholder="Search tickets…"
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
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In progress</option>
        <option value="PENDING">Pending</option>
        <option value="RESOLVED">Resolved</option>
        <option value="CLOSED">Closed</option>
      </select>
      <select
        defaultValue={params.get("priorityId") ?? ""}
        onChange={(e) => update("priorityId", e.target.value)}
        className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm"
      >
        <option value="">All priorities</option>
        {priorities.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <select
        defaultValue={params.get("categoryId") ?? ""}
        onChange={(e) => update("categoryId", e.target.value)}
        className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        defaultValue={params.get("clientId") ?? ""}
        onChange={(e) => update("clientId", e.target.value)}
        className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm"
      >
        <option value="">All clients</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.companyName}
          </option>
        ))}
      </select>
      <select
        defaultValue={params.get("assigneeId") ?? ""}
        onChange={(e) => update("assigneeId", e.target.value)}
        className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm"
      >
        <option value="">All assignees</option>
        {technicians.map((t) => (
          <option key={t.id} value={t.id}>
            {t.firstName} {t.lastName}
          </option>
        ))}
      </select>
    </div>
  );
}
