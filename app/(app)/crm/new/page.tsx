import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isCrmEnabled } from "@/lib/settings/service";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { listOpportunityStages } from "@/lib/taxonomies/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { OpportunityForm } from "../opportunity-form";
import { createOpportunityAction } from "../actions";

export default async function NewOpportunityPage() {
  await requirePermission("crm.manage");
  if (!(await isCrmEnabled())) notFound();
  const [clients, owners, stages, dict] = await Promise.all([
    listClients({}),
    listTechnicians(),
    listOpportunityStages({ activeOnly: true }),
    getDictionary(),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.crm, href: "/crm" }, { label: dict.crm.newOpportunity }]} />
      <h1 className="text-2xl font-semibold tracking-tight">{dict.crm.newOpportunity}</h1>
      <Card>
        <CardHeader><CardTitle>{dict.crm.newOpportunity}</CardTitle></CardHeader>
        <CardContent>
          <OpportunityForm
            action={createOpportunityAction}
            clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
            owners={owners}
            stages={stages.map((s) => ({ id: s.id, name: s.name }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
