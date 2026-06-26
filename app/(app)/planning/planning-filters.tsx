"use client";

import { useRouter, useSearchParams } from "next/navigation";

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function PlanningFilters({
  monday,
  technicians,
  types,
}: {
  monday: string; // YYYY-MM-DD of the current week's Monday
  technicians: { id: string; firstName: string; lastName: string }[];
  types: { id: string; name: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/planning?${next.toString()}`);
  }

  function shiftWeek(days: number) {
    const d = new Date(monday + "T00:00:00");
    d.setDate(d.getDate() + days);
    update("week", isoDate(d));
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => shiftWeek(-7)}
          className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm hover:bg-[var(--muted)]/70"
        >
          ‹ Prev
        </button>
        <button
          type="button"
          onClick={() => update("week", "")}
          className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm hover:bg-[var(--muted)]/70"
        >
          This week
        </button>
        <button
          type="button"
          onClick={() => shiftWeek(7)}
          className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm hover:bg-[var(--muted)]/70"
        >
          Next ›
        </button>
      </div>
      <select
        defaultValue={params.get("assigneeId") ?? ""}
        onChange={(e) => update("assigneeId", e.target.value)}
        className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm"
      >
        <option value="">All technicians</option>
        {technicians.map((t) => (
          <option key={t.id} value={t.id}>
            {t.firstName} {t.lastName}
          </option>
        ))}
      </select>
      <select
        defaultValue={params.get("typeId") ?? ""}
        onChange={(e) => update("typeId", e.target.value)}
        className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm"
      >
        <option value="">All types</option>
        {types.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}
