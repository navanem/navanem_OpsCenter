import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isCrmEnabled } from "@/lib/settings/service";
import { getLead } from "@/lib/crm/queries";
import { listTechnicians } from "@/lib/users/queries";
import { listLeadSources, listLeadStatuses } from "@/lib/taxonomies/queries";
import { formatLeadReference } from "@/lib/crm/meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { LeadForm } from "../../lead-form";
import { updateLeadAction, deleteLeadAction, convertLeadAction } from "../../actions";

export default async function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("crm.manage");
  if (!(await isCrmEnabled())) notFound();
  const { id } = await params;
  const [lead, owners, sources, statuses, dict] = await Promise.all([
    getLead(id),
    listTechnicians(),
    listLeadSources({ activeOnly: true }),
    listLeadStatuses({ activeOnly: true }),
    getDictionary(),
  ]);
  if (!lead) notFound();

  const ref = formatLeadReference(lead.number);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.crm, href: "/crm" }, { label: dict.crm.leads, href: "/crm/leads" }, { label: ref }]} />
      <h1 className="text-2xl font-semibold tracking-tight">{lead.companyName} <span className="font-mono text-base text-[var(--muted-foreground)]">{ref}</span></h1>

      <Card>
        <CardHeader><CardTitle>{dict.crm.conversion}</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          {lead.convertedClientId ? (
            <p className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#10b98122] px-2 py-0.5 text-xs font-medium text-[#10b981]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" /> {dict.crm.converted}
              </span>
              {lead.convertedClient ? (
                <Link href={`/clients/${lead.convertedClientId}`} className="text-[var(--primary)] hover:underline">{lead.convertedClient.companyName}</Link>
              ) : null}
            </p>
          ) : (
            <>
              <p className="text-[var(--muted-foreground)]">{dict.crm.convertHint}</p>
              <form action={convertLeadAction}>
                <input type="hidden" name="id" value={lead.id} />
                <Button type="submit" size="sm">{dict.crm.convertToClient}</Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{ref}</CardTitle></CardHeader>
        <CardContent>
          <LeadForm
            action={updateLeadAction}
            owners={owners}
            sources={sources.map((s) => ({ id: s.id, name: s.name }))}
            statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
            defaults={{
              id: lead.id,
              companyName: lead.companyName,
              contactName: lead.contactName,
              email: lead.email,
              phone: lead.phone,
              sourceId: lead.sourceId,
              statusId: lead.statusId,
              ownerId: lead.ownerId,
              estimatedValueCents: lead.estimatedValueCents,
              notes: lead.notes,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Danger zone</CardTitle></CardHeader>
        <CardContent>
          <form action={deleteLeadAction}>
            <input type="hidden" name="id" value={lead.id} />
            <Button type="submit" variant="destructive">{dict.common.delete}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
