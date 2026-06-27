"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/lib/i18n/provider";

export function TicketsFilters({
  clients,
  technicians,
  priorities,
  categories,
  tags,
}: {
  clients: { id: string; companyName: string }[];
  technicians: { id: string; firstName: string; lastName: string }[];
  priorities: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const t = useT();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/tickets?${next.toString()}`);
  }

  const selectCls = "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm";

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="search"
        defaultValue={params.get("search") ?? ""}
        placeholder={t.filters.searchTickets}
        onKeyDown={(e) => {
          if (e.key === "Enter") update("search", (e.target as HTMLInputElement).value);
        }}
        className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      />
      <select defaultValue={params.get("status") ?? ""} onChange={(e) => update("status", e.target.value)} className={selectCls}>
        <option value="">{t.common.allStatuses}</option>
        <option value="OPEN">{t.ticketStatus.OPEN}</option>
        <option value="IN_PROGRESS">{t.ticketStatus.IN_PROGRESS}</option>
        <option value="PENDING">{t.ticketStatus.PENDING}</option>
        <option value="RESOLVED">{t.ticketStatus.RESOLVED}</option>
        <option value="CLOSED">{t.ticketStatus.CLOSED}</option>
      </select>
      <select defaultValue={params.get("priorityId") ?? ""} onChange={(e) => update("priorityId", e.target.value)} className={selectCls}>
        <option value="">{t.common.allPriorities}</option>
        {priorities.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <select defaultValue={params.get("categoryId") ?? ""} onChange={(e) => update("categoryId", e.target.value)} className={selectCls}>
        <option value="">{t.common.allCategories}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <select defaultValue={params.get("clientId") ?? ""} onChange={(e) => update("clientId", e.target.value)} className={selectCls}>
        <option value="">{t.common.allClients}</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>{c.companyName}</option>
        ))}
      </select>
      <select defaultValue={params.get("assigneeId") ?? ""} onChange={(e) => update("assigneeId", e.target.value)} className={selectCls}>
        <option value="">{t.filters.allAssignees}</option>
        {technicians.map((tech) => (
          <option key={tech.id} value={tech.id}>{tech.firstName} {tech.lastName}</option>
        ))}
      </select>
      <select defaultValue={params.get("tagId") ?? ""} onChange={(e) => update("tagId", e.target.value)} className={selectCls}>
        <option value="">{t.common.allTags}</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.id}>{tag.name}</option>
        ))}
      </select>
    </div>
  );
}
