"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/lib/i18n/provider";

export function ProjectsFilters({
  statuses,
  clients,
  technicians,
}: {
  statuses: { id: string; name: string }[];
  clients: { id: string; companyName: string }[];
  technicians: { id: string; firstName: string; lastName: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const t = useT();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/projects?${next.toString()}`);
  }

  const selectCls = "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm";

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="search"
        defaultValue={params.get("search") ?? ""}
        placeholder={t.projects.searchPlaceholder}
        onKeyDown={(e) => {
          if (e.key === "Enter") update("search", (e.target as HTMLInputElement).value);
        }}
        className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      />
      <select defaultValue={params.get("statusId") ?? ""} onChange={(e) => update("statusId", e.target.value)} className={selectCls}>
        <option value="">{t.common.allStatuses}</option>
        {statuses.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <select defaultValue={params.get("clientId") ?? ""} onChange={(e) => update("clientId", e.target.value)} className={selectCls}>
        <option value="">{t.common.allClients}</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>{c.companyName}</option>
        ))}
      </select>
      <select defaultValue={params.get("leadId") ?? ""} onChange={(e) => update("leadId", e.target.value)} className={selectCls}>
        <option value="">{t.common.allLeads}</option>
        {technicians.map((tech) => (
          <option key={tech.id} value={tech.id}>{tech.firstName} {tech.lastName}</option>
        ))}
      </select>
    </div>
  );
}
