import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isContractsEnabled } from "@/lib/settings/service";
import { getContract } from "@/lib/contracts/queries";
import { listClients } from "@/lib/clients/queries";
import { listContractTypes, listContractStatuses } from "@/lib/taxonomies/queries";
import { formatContractReference } from "@/lib/contracts/meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContractForm } from "../../contract-form";
import { updateContractAction, deleteContractAction } from "../../actions";

export default async function EditContractPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("contracts.manage");
  if (!(await isContractsEnabled())) notFound();
  const { id } = await params;

  const [contract, clients, types, statuses] = await Promise.all([
    getContract(id),
    listClients({}),
    listContractTypes({ activeOnly: true }),
    listContractStatuses({ activeOnly: true }),
  ]);

  if (!contract) notFound();

  const ref = formatContractReference(contract.number);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Contracts", href: "/contracts" }, { label: ref }]} />
      <h1 className="text-2xl font-semibold tracking-tight">{ref}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{contract.name ?? contract.client.companyName}</CardTitle>
        </CardHeader>
        <CardContent>
          <ContractForm
            action={updateContractAction}
            clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
            types={types.map((t) => ({ id: t.id, name: t.name }))}
            statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
            defaults={{
              id: contract.id,
              name: contract.name,
              clientId: contract.clientId,
              typeId: contract.typeId,
              statusId: contract.statusId,
              startDate: contract.startDate,
              endDate: contract.endDate,
              value: contract.valueCents != null ? (contract.valueCents / 100).toFixed(2) : "",
              billingCycle: contract.billingCycle,
              includedHours: contract.includedMinutesPerPeriod != null ? (contract.includedMinutesPerPeriod / 60).toString() : "",
              notes: contract.notes,
            }}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={deleteContractAction}>
            <input type="hidden" name="id" value={contract.id} />
            <Button type="submit" variant="destructive">Delete contract</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
