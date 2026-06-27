import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isCrmEnabled } from "@/lib/settings/service";
import { getOpportunity } from "@/lib/crm/queries";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { listOpportunityStages } from "@/lib/taxonomies/queries";
import { formatOpportunityReference } from "@/lib/crm/meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { OpportunityForm } from "../../opportunity-form";
import { updateOpportunityAction, deleteOpportunityAction } from "../../actions";

export default async function EditOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("crm.manage");
  if (!(await isCrmEnabled())) notFound();
  const { id } = await params;
  const [opp, clients, owners, stages, dict] = await Promise.all([
    getOpportunity(id),
    listClients({}),
    listTechnicians(),
    listOpportunityStages({ activeOnly: true }),
    getDictionary(),
  ]);
  if (!opp) notFound();

  const ref = formatOpportunityReference(opp.number);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.crm, href: "/crm" }, { label: ref }]} />
      <h1 className="text-2xl font-semibold tracking-tight">{opp.name} <span className="font-mono text-base text-[var(--muted-foreground)]">{ref}</span></h1>

      <Card>
        <CardHeader><CardTitle>{ref}</CardTitle></CardHeader>
        <CardContent>
          <OpportunityForm
            action={updateOpportunityAction}
            clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
            owners={owners}
            stages={stages.map((s) => ({ id: s.id, name: s.name }))}
            defaults={{
              id: opp.id,
              name: opp.name,
              clientId: opp.clientId,
              stageId: opp.stageId,
              ownerId: opp.ownerId,
              valueCents: opp.valueCents,
              probability: opp.probability,
              outcome: opp.outcome,
              expectedCloseAt: opp.expectedCloseAt,
              notes: opp.notes,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Danger zone</CardTitle></CardHeader>
        <CardContent>
          <form action={deleteOpportunityAction}>
            <input type="hidden" name="id" value={opp.id} />
            <Button type="submit" variant="destructive">{dict.common.delete}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
