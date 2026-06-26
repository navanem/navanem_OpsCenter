"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function PlanningFilters({
  month,
  technicians,
  types,
}: {
  month: string; // YYYY-MM of the displayed month
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

  function shiftMonth(delta: number) {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    update("month", `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}`);
  }

  const navBtn =
    "rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--muted)]";
  const selectCls =
    "rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month" className={navBtn}>‹</button>
        <button type="button" onClick={() => update("month", "")} className={navBtn}>Today</button>
        <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month" className={navBtn}>›</button>
      </div>
      <select defaultValue={params.get("assigneeId") ?? ""} onChange={(e) => update("assigneeId", e.target.value)} className={selectCls}>
        <option value="">All technicians</option>
        {technicians.map((t) => (
          <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
        ))}
      </select>
      <select defaultValue={params.get("typeId") ?? ""} onChange={(e) => update("typeId", e.target.value)} className={selectCls}>
        <option value="">All types</option>
        {types.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
    </div>
  );
}
