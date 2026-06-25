import { requirePermission } from "@/lib/auth/guard";
import {
  listTicketCategories,
  listTicketPriorities,
  listClientIndustries,
} from "@/lib/taxonomies/queries";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TaxonomyManager } from "./taxonomy-manager";

export default async function TaxonomiesPage() {
  await requirePermission("settings.manage");

  const [categories, priorities, industries] = await Promise.all([
    listTicketCategories(),
    listTicketPriorities(),
    listClientIndustries(),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[{ label: "Settings", href: "/settings" }, { label: "Taxonomies" }]}
      />
      <h1 className="text-2xl font-semibold tracking-tight">Taxonomies</h1>

      <div className="space-y-6">
        <TaxonomyManager kind="category" title="Ticket categories" items={categories} />
        <TaxonomyManager kind="priority" title="Ticket priorities" items={priorities} />
        <TaxonomyManager kind="industry" title="Client industries" items={industries} />
      </div>
    </div>
  );
}
