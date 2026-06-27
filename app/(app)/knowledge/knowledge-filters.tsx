"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/lib/i18n/provider";

const cls = "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

export function KnowledgeFilters({
  categories,
  canManage,
}: {
  categories: { id: string; name: string }[];
  canManage: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const t = useT();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/knowledge?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="search"
        defaultValue={params.get("search") ?? ""}
        placeholder={t.knowledge.searchPlaceholder}
        onKeyDown={(e) => {
          if (e.key === "Enter") update("search", (e.target as HTMLInputElement).value);
        }}
        className={`${cls} min-w-56 flex-1`}
      />
      <select defaultValue={params.get("categoryId") ?? ""} onChange={(e) => update("categoryId", e.target.value)} className={cls}>
        <option value="">{t.common.allCategories}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      {canManage ? (
        <select defaultValue={params.get("status") ?? ""} onChange={(e) => update("status", e.target.value)} className={cls}>
          <option value="">{t.common.allStatuses}</option>
          <option value="PUBLISHED">{t.knowledge.kpiPublished}</option>
          <option value="DRAFT">{t.knowledge.draft}</option>
        </select>
      ) : null}
    </div>
  );
}
