"use client";

import { useState } from "react";
import { TaxonomyManager } from "./taxonomy-manager";

type Item = { id: string; name: string; color?: string | null; sortOrder: number; isActive: boolean };

const TABS = [
  { key: "category", label: "Ticket categories" },
  { key: "priority", label: "Ticket priorities" },
  { key: "industry", label: "Client industries" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function TaxonomyTabs({
  categories,
  priorities,
  industries,
}: {
  categories: Item[];
  priorities: Item[];
  industries: Item[];
}) {
  const [tab, setTab] = useState<TabKey>("category");
  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-[var(--border)]">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition " +
              (tab === t.key
                ? "border-[var(--primary)] text-[var(--foreground)]"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]")
            }
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "category" ? (
        <TaxonomyManager kind="category" title="Ticket categories" items={categories} />
      ) : null}
      {tab === "priority" ? (
        <TaxonomyManager kind="priority" title="Ticket priorities" items={priorities} />
      ) : null}
      {tab === "industry" ? (
        <TaxonomyManager kind="industry" title="Client industries" items={industries} />
      ) : null}
    </div>
  );
}
