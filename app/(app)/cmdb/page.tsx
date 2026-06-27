import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { isCmdbEnabled } from "@/lib/settings/service";
import { listConfigItems, getCmdbStats } from "@/lib/cmdb/queries";
import { listClients } from "@/lib/clients/queries";
import { listConfigItemTypes, listConfigItemStatuses } from "@/lib/taxonomies/queries";
import { formatCiReference } from "@/lib/cmdb/meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { CmdbFilters } from "./cmdb-filters";

type SP = { search?: string; clientId?: string; typeId?: string; statusId?: string };

function Badge({ name, color }: { name: string; color: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${color}22`, color }}>{name}</span>
  );
}

export default async function CmdbPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePermission("cmdb.read");
  if (!(await isCmdbEnabled())) notFound();
  const [sp, dict] = await Promise.all([searchParams, getDictionary()]);

  const [items, stats, clients, types, statuses] = await Promise.all([
    listConfigItems({ search: sp.search, clientId: sp.clientId, typeId: sp.typeId, statusId: sp.statusId }),
    getCmdbStats(),
    listClients({}),
    listConfigItemTypes({ activeOnly: true }),
    listConfigItemStatuses({ activeOnly: true }),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.cmdb }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{dict.nav.cmdb}</h1>
        {can(user, "cmdb.manage") ? <Link href="/cmdb/new"><Button>{dict.cmdb.new}</Button></Link> : null}
      </div>

      <StatGrid>
        <StatCard label={dict.cmdb.kpiTotal} value={stats.total} color="#06b6d4" />
        <StatCard label={dict.cmdb.kpiTypes} value={stats.types} color="#6d5efc" />
        <StatCard label={dict.cmdb.kpiStatuses} value={stats.statuses} color="#f59e0b" />
        <StatCard label={dict.cmdb.kpiLinkedDevices} value={stats.linkedToDevices} color="#10b981" />
      </StatGrid>

      <CmdbFilters
        clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
        types={types.map((t) => ({ id: t.id, name: t.name }))}
        statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
      />

      <Card>
        {items.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">{dict.cmdb.noneFound}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.ref}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.name}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.type}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.status}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.client}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.cmdb.environment}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((ci) => (
                <tr key={ci.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/40">
                  <td className="px-4 py-3">
                    <Link href={`/cmdb/${ci.id}/edit`} className="inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs hover:underline">{formatCiReference(ci.number)}</Link>
                  </td>
                  <td className="px-4 py-3 font-medium">{ci.name}</td>
                  <td className="px-4 py-3">{ci.type ? <Badge name={ci.type.name} color={ci.type.color} /> : <span className="text-[var(--muted-foreground)]">—</span>}</td>
                  <td className="px-4 py-3">{ci.status ? <Badge name={ci.status.name} color={ci.status.color} /> : <span className="text-[var(--muted-foreground)]">—</span>}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{ci.client?.companyName ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{ci.environment ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
