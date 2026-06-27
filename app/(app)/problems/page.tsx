import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { isProblemsEnabled } from "@/lib/settings/service";
import { listProblems, getProblemStats } from "@/lib/problems/queries";
import { listClients } from "@/lib/clients/queries";
import { listProblemTypes, listProblemStatuses } from "@/lib/taxonomies/queries";
import { formatProblemReference } from "@/lib/problems/meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { ProblemsFilters } from "./problems-filters";

type SP = { search?: string; clientId?: string; typeId?: string; statusId?: string };

function Badge({ name, color }: { name: string; color: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${color}22`, color }}>{name}</span>
  );
}

function priorityLabel(priority: string | null, p: Awaited<ReturnType<typeof getDictionary>>["problems"]): string {
  switch (priority) {
    case "LOW": return p.priorityLow;
    case "MEDIUM": return p.priorityMedium;
    case "HIGH": return p.priorityHigh;
    case "CRITICAL": return p.priorityCritical;
    default: return "—";
  }
}

export default async function ProblemsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePermission("problems.read");
  if (!(await isProblemsEnabled())) notFound();
  const [sp, dict] = await Promise.all([searchParams, getDictionary()]);

  const [problems, stats, clients, types, statuses] = await Promise.all([
    listProblems({ search: sp.search, clientId: sp.clientId, typeId: sp.typeId, statusId: sp.statusId }),
    getProblemStats(),
    listClients({}),
    listProblemTypes({ activeOnly: true }),
    listProblemStatuses({ activeOnly: true }),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.problems }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{dict.nav.problems}</h1>
        {can(user, "problems.manage") ? <Link href="/problems/new"><Button>{dict.problems.new}</Button></Link> : null}
      </div>

      <StatGrid>
        <StatCard label={dict.problems.kpiTotal} value={stats.total} color="#6d5efc" />
        <StatCard label={dict.problems.kpiOpen} value={stats.open} color="#f59e0b" />
        <StatCard label={dict.problems.kpiKnownErrors} value={stats.knownErrors} color="#ef4444" />
        <StatCard label={dict.problems.kpiResolved} value={stats.resolved} color="#10b981" />
      </StatGrid>

      <ProblemsFilters
        clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
        types={types.map((t) => ({ id: t.id, name: t.name }))}
        statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
      />

      <Card>
        {problems.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">{dict.problems.noneFound}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.ref}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.title}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.type}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.status}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.client}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.problems.priority}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.problems.knownError}</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p) => (
                <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/40">
                  <td className="px-4 py-3">
                    <Link href={`/problems/${p.id}/edit`} className="inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs hover:underline">{formatProblemReference(p.number)}</Link>
                  </td>
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3">{p.type ? <Badge name={p.type.name} color={p.type.color} /> : <span className="text-[var(--muted-foreground)]">—</span>}</td>
                  <td className="px-4 py-3"><Badge name={p.status.name} color={p.status.color} /></td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{p.client?.companyName ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{priorityLabel(p.priority, dict.problems)}</td>
                  <td className="px-4 py-3">{p.knownError ? <span className="text-xs font-medium text-[#ef4444]">{dict.common.yes}</span> : <span className="text-[var(--muted-foreground)]">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
