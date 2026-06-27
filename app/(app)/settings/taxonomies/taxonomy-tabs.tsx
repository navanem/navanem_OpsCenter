"use client";

import { useState } from "react";
import { TaxonomyManager } from "./taxonomy-manager";
import { ContractTypeManager } from "../contract-types/contract-type-manager";

type Item = { id: string; name: string; color?: string | null; sortOrder: number; isActive: boolean };

const TABS = [
  { key: "ticket-type", label: "Ticket types" },
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
  { key: "subscription-type", label: "Subscription types" },
  { key: "subscription-status", label: "Subscription statuses" },
  { key: "change-type", label: "Change types" },
  { key: "change-status", label: "Change statuses" },
  { key: "ci-type", label: "CI types" },
  { key: "ci-status", label: "CI statuses" },
  { key: "opportunity-stage", label: "Opportunity stages" },
  { key: "lead-source", label: "Lead sources" },
  { key: "lead-status", label: "Lead statuses" },
  { key: "problem-type", label: "Problem types" },
  { key: "problem-status", label: "Problem statuses" },
  { key: "release-type", label: "Release types" },
  { key: "release-status", label: "Release statuses" },
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
  subscriptionTypes,
  subscriptionStatuses,
  ticketTypes,
  changeTypes,
  changeStatuses,
  ciTypes,
  ciStatuses,
  opportunityStages,
  leadSources,
  leadStatuses,
  problemTypes,
  problemStatuses,
  releaseTypes,
  releaseStatuses,
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
  subscriptionTypes: Item[];
  subscriptionStatuses: Item[];
  ticketTypes: Item[];
  changeTypes: Item[];
  changeStatuses: Item[];
  ciTypes: Item[];
  ciStatuses: Item[];
  opportunityStages: Item[];
  leadSources: Item[];
  leadStatuses: Item[];
  problemTypes: Item[];
  problemStatuses: Item[];
  releaseTypes: Item[];
  releaseStatuses: Item[];
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
      {tab === "ticket-type" ? (
        <TaxonomyManager kind="ticket-type" title="Ticket types" items={ticketTypes} />
      ) : null}
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
      {tab === "subscription-type" ? (
        <TaxonomyManager kind="subscription-type" title="Subscription types" items={subscriptionTypes} />
      ) : null}
      {tab === "subscription-status" ? (
        <TaxonomyManager kind="subscription-status" title="Subscription statuses" items={subscriptionStatuses} />
      ) : null}
      {tab === "change-type" ? (
        <TaxonomyManager kind="change-type" title="Change types" items={changeTypes} />
      ) : null}
      {tab === "change-status" ? (
        <TaxonomyManager kind="change-status" title="Change statuses" items={changeStatuses} />
      ) : null}
      {tab === "ci-type" ? (
        <TaxonomyManager kind="ci-type" title="CI types" items={ciTypes} />
      ) : null}
      {tab === "ci-status" ? (
        <TaxonomyManager kind="ci-status" title="CI statuses" items={ciStatuses} />
      ) : null}
      {tab === "opportunity-stage" ? (
        <TaxonomyManager kind="opportunity-stage" title="Opportunity stages" items={opportunityStages} />
      ) : null}
      {tab === "lead-source" ? (
        <TaxonomyManager kind="lead-source" title="Lead sources" items={leadSources} />
      ) : null}
      {tab === "lead-status" ? (
        <TaxonomyManager kind="lead-status" title="Lead statuses" items={leadStatuses} />
      ) : null}
      {tab === "problem-type" ? (
        <TaxonomyManager kind="problem-type" title="Problem types" items={problemTypes} />
      ) : null}
      {tab === "problem-status" ? (
        <TaxonomyManager kind="problem-status" title="Problem statuses" items={problemStatuses} />
      ) : null}
      {tab === "release-type" ? (
        <TaxonomyManager kind="release-type" title="Release types" items={releaseTypes} />
      ) : null}
      {tab === "release-status" ? (
        <TaxonomyManager kind="release-status" title="Release statuses" items={releaseStatuses} />
      ) : null}
    </div>
  );
}
