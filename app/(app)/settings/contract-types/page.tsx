import { requirePermission } from "@/lib/auth/guard";
import { listContractTypes } from "@/lib/taxonomies/queries";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContractTypeManager } from "./contract-type-manager";

export default async function ContractTypesPage() {
  await requirePermission("settings.manage");
  const types = await listContractTypes();

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Settings", href: "/settings" },
          { label: "Contracts", href: "/settings/contracts" },
          { label: "Contract types" },
        ]}
      />
      <h1 className="text-2xl font-semibold tracking-tight">Contract types</h1>
      <ContractTypeManager
        items={types.map((t) => ({
          id: t.id,
          name: t.name,
          color: t.color,
          sortOrder: t.sortOrder,
          isActive: t.isActive,
          defaultHourlyRateCents: t.defaultHourlyRateCents,
        }))}
      />
    </div>
  );
}
