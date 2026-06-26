import { requirePermission } from "@/lib/auth/guard";
import {
  listTicketCategories,
  listTicketPriorities,
  listClientIndustries,
  listProjectStatuses,
  listProjectTaskStatuses,
  listVisitTypes,
  listContractTypes,
  listContractStatuses,
  listTicketTags,
  listKnowledgeCategories,
} from "@/lib/taxonomies/queries";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TaxonomyTabs } from "./taxonomy-tabs";

export default async function TaxonomiesPage() {
  await requirePermission("settings.manage");

  const [categories, priorities, industries, projectStatuses, taskStatuses, visitTypes, contractTypes, contractStatuses, tags, knowledgeCategories] =
    await Promise.all([
      listTicketCategories(),
      listTicketPriorities(),
      listClientIndustries(),
      listProjectStatuses(),
      listProjectTaskStatuses(),
      listVisitTypes(),
      listContractTypes(),
      listContractStatuses(),
      listTicketTags(),
      listKnowledgeCategories(),
    ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[{ label: "Settings", href: "/settings" }, { label: "Taxonomies" }]}
      />
      <h1 className="text-2xl font-semibold tracking-tight">Taxonomies</h1>

      <TaxonomyTabs
        categories={categories}
        priorities={priorities}
        industries={industries}
        projectStatuses={projectStatuses}
        taskStatuses={taskStatuses}
        visitTypes={visitTypes}
        contractTypes={contractTypes.map((t) => ({
          id: t.id,
          name: t.name,
          color: t.color,
          sortOrder: t.sortOrder,
          isActive: t.isActive,
          defaultHourlyRateCents: t.defaultHourlyRateCents,
        }))}
        contractStatuses={contractStatuses}
        tags={tags}
        knowledgeCategories={knowledgeCategories}
      />
    </div>
  );
}
