"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/lib/i18n/provider";

export function ClientsFilters({
  technicians,
}: {
  technicians: { id: string; firstName: string; lastName: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const t = useT();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/clients?${next.toString()}`);
  }

  const selectCls = "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm";

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="search"
        defaultValue={params.get("search") ?? ""}
        placeholder={t.clients.searchPlaceholder}
        onKeyDown={(e) => {
          if (e.key === "Enter") update("search", (e.target as HTMLInputElement).value);
        }}
        className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      />
      <select defaultValue={params.get("status") ?? ""} onChange={(e) => update("status", e.target.value)} className={selectCls}>
        <option value="">{t.common.allStatuses}</option>
        <option value="ACTIVE">{t.common.active}</option>
        <option value="INACTIVE">{t.common.inactive}</option>
      </select>
      <select defaultValue={params.get("technicianId") ?? ""} onChange={(e) => update("technicianId", e.target.value)} className={selectCls}>
        <option value="">{t.common.allTechnicians}</option>
        {technicians.map((tech) => (
          <option key={tech.id} value={tech.id}>{tech.firstName} {tech.lastName}</option>
        ))}
      </select>
    </div>
  );
}
