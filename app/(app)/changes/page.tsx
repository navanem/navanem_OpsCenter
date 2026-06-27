import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { isChangesEnabled } from "@/lib/settings/service";
import { listChanges, getChangeStats } from "@/lib/changes/queries";
import { listClients } from "@/lib/clients/queries";
import { listChangeTypes, listChangeStatuses } from "@/lib/taxonomies/queries";
import { formatChangeReference } from "@/lib/changes/meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { ChangesFilters } from "./changes-filters";

type SP = { search?: string; clientId?: string; typeId?: string; statusId?: string };

function Badge({ name, color }: { name: string; color: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${color}22`, color }}>{name}</span>
  );
}

export default async function ChangesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePermission("changes.read");
  if (!(await isChangesEnabled())) notFound();
  const [sp, dict] = await Promise.all([searchParams, getDictionary()]);

  const [changes, stats, clients, types, statuses] = await Promise.all([
    listChanges({ search: sp.search, clientId: sp.clientId, typeId: sp.typeId, statusId: sp.statusId }),
    getChangeStats(),
    listClients({}),
    listChangeTypes({ activeOnly: true }),
    listChangeStatuses({ activeOnly: true }),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.changes }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{dict.nav.changes}</h1>
        {can(user, "changes.manage") ? <Link href="/changes/new"><Button>{dict.changes.new}</Button></Link> : null}
      </div>

      <StatGrid>
        <StatCard label={dict.changes.kpiTotal} value={stats.total} color="#6d5efc" />
        <StatCard label={dict.changes.kpiPending} value={stats.pending} color="#f59e0b" />
        <StatCard label={dict.changes.kpiUpcoming} value={stats.upcoming} color="#3b82f6" />
        <StatCard label={dict.changes.kpiApproved} value={stats.approved} color="#10b981" />
      </StatGrid>

      <ChangesFilters
        clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
        types={types.map((t) => ({ id: t.id, name: t.name }))}
        statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
      />

      <Card>
        {changes.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">{dict.changes.noneFound}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.ref}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.title}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.type}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.status}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.client}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.changes.risk}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.changes.colPlanned}</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((c) => (
                <tr key={c.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/40">
                  <td className="px-4 py-3">
                    <Link href={`/changes/${c.id}/edit`} className="inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs hover:underline">{formatChangeReference(c.number)}</Link>
                  </td>
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3">{c.type ? <Badge name={c.type.name} color={c.type.color} /> : <span className="text-[var(--muted-foreground)]">—</span>}</td>
                  <td className="px-4 py-3"><Badge name={c.status.name} color={c.status.color} /></td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{c.client?.companyName ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{c.risk ? (c.risk === "LOW" ? dict.changes.riskLow : c.risk === "MEDIUM" ? dict.changes.riskMedium : dict.changes.riskHigh) : "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[var(--muted-foreground)]">{c.plannedStart ? new Date(c.plannedStart).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
