import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isContractsEnabled } from "@/lib/settings/service";
import { listClients } from "@/lib/clients/queries";
import { listContractTypes, listContractStatuses } from "@/lib/taxonomies/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContractForm } from "../contract-form";
import { createContractAction } from "../actions";

export default async function NewContractPage() {
  await requirePermission("contracts.manage");
  if (!(await isContractsEnabled())) notFound();

  const [clients, types, statuses] = await Promise.all([
    listClients({}),
    listContractTypes({ activeOnly: true }),
    listContractStatuses({ activeOnly: true }),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Contracts", href: "/contracts" }, { label: "New contract" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">New contract</h1>
      <Card>
        <CardHeader>
          <CardTitle>New contract</CardTitle>
        </CardHeader>
        <CardContent>
          <ContractForm
            action={createContractAction}
            clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
            types={types.map((t) => ({ id: t.id, name: t.name }))}
            statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
            submitLabel="Create contract"
          />
        </CardContent>
      </Card>
    </div>
  );
}
