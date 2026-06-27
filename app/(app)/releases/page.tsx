import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { isReleasesEnabled } from "@/lib/settings/service";
import { listReleases, getReleaseStats } from "@/lib/releases/queries";
import { listClients } from "@/lib/clients/queries";
import { listReleaseTypes, listReleaseStatuses } from "@/lib/taxonomies/queries";
import { formatReleaseReference } from "@/lib/releases/meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { ReleasesFilters } from "./releases-filters";

type SP = { search?: string; clientId?: string; typeId?: string; statusId?: string };

function Badge({ name, color }: { name: string; color: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${color}22`, color }}>{name}</span>
  );
}

export default async function ReleasesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePermission("releases.read");
  if (!(await isReleasesEnabled())) notFound();
  const [sp, dict] = await Promise.all([searchParams, getDictionary()]);

  const [releases, stats, clients, types, statuses] = await Promise.all([
    listReleases({ search: sp.search, clientId: sp.clientId, typeId: sp.typeId, statusId: sp.statusId }),
    getReleaseStats(),
    listClients({}),
    listReleaseTypes({ activeOnly: true }),
    listReleaseStatuses({ activeOnly: true }),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.releases }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{dict.nav.releases}</h1>
        {can(user, "releases.manage") ? <Link href="/releases/new"><Button>{dict.releases.new}</Button></Link> : null}
      </div>

      <StatGrid>
        <StatCard label={dict.releases.kpiTotal} value={stats.total} color="#6d5efc" />
        <StatCard label={dict.releases.kpiPlanned} value={stats.planned} color="#f59e0b" />
        <StatCard label={dict.releases.kpiUpcoming} value={stats.upcoming} color="#3b82f6" />
        <StatCard label={dict.releases.kpiReleased} value={stats.released} color="#10b981" />
      </StatGrid>

      <ReleasesFilters
        clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
        types={types.map((t) => ({ id: t.id, name: t.name }))}
        statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
      />

      <Card>
        {releases.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">{dict.releases.noneFound}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.ref}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.name}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.releases.version}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.type}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.status}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.releases.plannedDate}</th>
              </tr>
            </thead>
            <tbody>
              {releases.map((r) => (
                <tr key={r.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/40">
                  <td className="px-4 py-3">
                    <Link href={`/releases/${r.id}/edit`} className="inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs hover:underline">{formatReleaseReference(r.number)}</Link>
                  </td>
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted-foreground)]">{r.version ?? "—"}</td>
                  <td className="px-4 py-3">{r.type ? <Badge name={r.type.name} color={r.type.color} /> : <span className="text-[var(--muted-foreground)]">—</span>}</td>
                  <td className="px-4 py-3"><Badge name={r.status.name} color={r.status.color} /></td>
                  <td className="px-4 py-3 whitespace-nowrap text-[var(--muted-foreground)]">{r.plannedDate ? new Date(r.plannedDate).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
