"use client";

import { useState } from "react";
import { TaxonomyManager } from "./taxonomy-manager";
import { ContractTypeManager } from "../contract-types/contract-type-manager";

type Item = { id: string; name: string; color?: string | null; sortOrder: number; isActive: boolean };

const TABS = [
  { key: "category", label: "Ticket categories" },
  { key: "priority", label: "Ticket priorities" },
  { key: "industry", label: "Client industries" },
  { key: "project-status", label: "Project statuses" },
  { key: "task-status", label: "Task statuses" },
  { key: "visit-type", label: "Visit types" },
  { key: "contract-type", label: "Contract types" },
  { key: "contract-status", label: "Contract statuses" },
  { key: "tag", label: "Ticket tags" },
  { key: "knowledge-category", label: "Knowledge categories" },
  { key: "device-type", label: "Device types" },
  { key: "device-status", label: "Device statuses" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function TaxonomyTabs({
  categories,
  priorities,
  industries,
  projectStatuses,
  taskStatuses,
  visitTypes,
  contractTypes,
  contractStatuses,
  tags,
  knowledgeCategories,
  deviceTypes,
  deviceStatuses,
}: {
  categories: Item[];
  priorities: Item[];
  industries: Item[];
  projectStatuses: Item[];
  taskStatuses: Item[];
  visitTypes: Item[];
  contractTypes: { id: string; name: string; color: string; sortOrder: number; isActive: boolean; defaultHourlyRateCents: number | null }[];
  contractStatuses: Item[];
  tags: Item[];
  knowledgeCategories: Item[];
  deviceTypes: Item[];
  deviceStatuses: Item[];
}) {
  const [tab, setTab] = useState<TabKey>("category");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1 border-b border-[var(--border)]">
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
      {tab === "project-status" ? (
        <TaxonomyManager kind="project-status" title="Project statuses" items={projectStatuses} />
      ) : null}
      {tab === "task-status" ? (
        <TaxonomyManager kind="task-status" title="Task statuses" items={taskStatuses} />
      ) : null}
      {tab === "visit-type" ? (
        <TaxonomyManager kind="visit-type" title="Visit types" items={visitTypes} />
      ) : null}
      {tab === "contract-type" ? (
        <ContractTypeManager items={contractTypes} />
      ) : null}
      {tab === "contract-status" ? (
        <TaxonomyManager kind="contract-status" title="Contract statuses" items={contractStatuses} />
      ) : null}
      {tab === "tag" ? (
        <TaxonomyManager kind="tag" title="Ticket tags" items={tags} />
      ) : null}
      {tab === "knowledge-category" ? (
        <TaxonomyManager kind="knowledge-category" title="Knowledge categories" items={knowledgeCategories} />
      ) : null}
      {tab === "device-type" ? (
        <TaxonomyManager kind="device-type" title="Device types" items={deviceTypes} />
      ) : null}
      {tab === "device-status" ? (
        <TaxonomyManager kind="device-status" title="Device statuses" items={deviceStatuses} />
      ) : null}
    </div>
  );
}
