import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { isCrmEnabled } from "@/lib/settings/service";
import { listLeads } from "@/lib/crm/queries";
import { listLeadSources, listLeadStatuses } from "@/lib/taxonomies/queries";
import { formatLeadReference, formatMoneyCents } from "@/lib/crm/meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { CrmTabs } from "../crm-tabs";
import { LeadsFilters } from "./leads-filters";

type SP = { search?: string; sourceId?: string; statusId?: string };

function Badge({ name, color }: { name: string; color: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${color}22`, color }}>{name}</span>
  );
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePermission("crm.read");
  if (!(await isCrmEnabled())) notFound();
  const [sp, dict] = await Promise.all([searchParams, getDictionary()]);

  const [leads, sources, statuses] = await Promise.all([
    listLeads({ search: sp.search, sourceId: sp.sourceId, statusId: sp.statusId }),
    listLeadSources({ activeOnly: true }),
    listLeadStatuses({ activeOnly: true }),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.crm, href: "/crm" }, { label: dict.crm.leads }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{dict.nav.crm}</h1>
        {can(user, "crm.manage") ? <Link href="/crm/leads/new"><Button>{dict.crm.newLead}</Button></Link> : null}
      </div>

      <CrmTabs />

      <LeadsFilters
        sources={sources.map((s) => ({ id: s.id, name: s.name }))}
        statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
      />

      <Card>
        {leads.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">{dict.crm.noLeads}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.ref}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.crm.company}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.crm.contact}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.crm.source}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.status}</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide">{dict.crm.estimatedValue}</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/40">
                  <td className="px-4 py-3">
                    <Link href={`/crm/leads/${l.id}/edit`} className="inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs hover:underline">{formatLeadReference(l.number)}</Link>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {l.companyName}
                    {l.convertedClientId ? <span className="ml-2 inline-flex items-center rounded-full bg-[#10b98122] px-2 py-0.5 text-[10px] font-medium text-[#10b981]">{dict.crm.converted}</span> : null}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{l.contactName ?? "—"}</td>
                  <td className="px-4 py-3">{l.source ? <Badge name={l.source.name} color={l.source.color} /> : <span className="text-[var(--muted-foreground)]">—</span>}</td>
                  <td className="px-4 py-3">{l.status ? <Badge name={l.status.name} color={l.status.color} /> : <span className="text-[var(--muted-foreground)]">—</span>}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatMoneyCents(l.estimatedValueCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
