import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isCrmEnabled } from "@/lib/settings/service";
import { listTechnicians } from "@/lib/users/queries";
import { listLeadSources, listLeadStatuses } from "@/lib/taxonomies/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { LeadForm } from "../lead-form";
import { createLeadAction } from "../actions";

export default async function NewLeadPage() {
  await requirePermission("crm.manage");
  if (!(await isCrmEnabled())) notFound();
  const [owners, sources, statuses, dict] = await Promise.all([
    listTechnicians(),
    listLeadSources({ activeOnly: true }),
    listLeadStatuses({ activeOnly: true }),
    getDictionary(),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.crm, href: "/crm" }, { label: dict.crm.leads, href: "/crm/leads" }, { label: dict.crm.newLead }]} />
      <h1 className="text-2xl font-semibold tracking-tight">{dict.crm.newLead}</h1>
      <Card>
        <CardHeader><CardTitle>{dict.crm.newLead}</CardTitle></CardHeader>
        <CardContent>
          <LeadForm
            action={createLeadAction}
            owners={owners}
            sources={sources.map((s) => ({ id: s.id, name: s.name }))}
            statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
