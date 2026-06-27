"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/lib/i18n/provider";

const cls = "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

export function ReleasesFilters({
  clients,
  types,
  statuses,
}: {
  clients: { id: string; companyName: string }[];
  types: { id: string; name: string }[];
  statuses: { id: string; name: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const t = useT();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/releases?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <input type="search" defaultValue={params.get("search") ?? ""} placeholder={t.common.searchPlaceholder}
        onKeyDown={(e) => { if (e.key === "Enter") update("search", (e.target as HTMLInputElement).value); }}
        className={`${cls} min-w-56 flex-1`} />
      <select defaultValue={params.get("clientId") ?? ""} onChange={(e) => update("clientId", e.target.value)} className={cls}>
        <option value="">{t.common.allClients}</option>
        {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
      </select>
      <select defaultValue={params.get("typeId") ?? ""} onChange={(e) => update("typeId", e.target.value)} className={cls}>
        <option value="">{t.common.allTypes}</option>
        {types.map((ty) => <option key={ty.id} value={ty.id}>{ty.name}</option>)}
      </select>
      <select defaultValue={params.get("statusId") ?? ""} onChange={(e) => update("statusId", e.target.value)} className={cls}>
        <option value="">{t.common.allStatuses}</option>
        {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
    </div>
  );
}
