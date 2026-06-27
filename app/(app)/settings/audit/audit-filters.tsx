"use client";

import { useRouter, useSearchParams } from "next/navigation";

const cls = "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

export function AuditFilters({ types, actions }: { types: string[]; actions: string[] }) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`/settings/audit?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <input type="search" defaultValue={params.get("search") ?? ""} placeholder="Search…"
        onKeyDown={(e) => { if (e.key === "Enter") update("search", (e.target as HTMLInputElement).value); }}
        className={`${cls} min-w-56 flex-1`} />
      <select defaultValue={params.get("entityType") ?? ""} onChange={(e) => update("entityType", e.target.value)} className={cls}>
        <option value="">All entities</option>
        {types.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <select defaultValue={params.get("action") ?? ""} onChange={(e) => update("action", e.target.value)} className={cls}>
        <option value="">All actions</option>
        {actions.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
    </div>
  );
}
