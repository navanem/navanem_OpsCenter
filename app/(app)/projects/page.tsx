import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { listProjects, getProjectStats } from "@/lib/projects/queries";
import { listProjectStatuses } from "@/lib/taxonomies/queries";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { formatProjectReference } from "@/lib/projects/meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { StatusBadge } from "@/components/projects/badges";
import { getDictionary } from "@/lib/i18n/server";
import { ProjectsFilters } from "./projects-filters";

type SP = { search?: string; statusId?: string; clientId?: string; leadId?: string };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePermission("projects.read");
  const [sp, dict] = await Promise.all([searchParams, getDictionary()]);

  const [projects, statuses, clients, technicians, stats] = await Promise.all([
    listProjects({
      search: sp.search,
      statusId: sp.statusId,
      clientId: sp.clientId,
      leadId: sp.leadId,
    }),
    listProjectStatuses({ activeOnly: true }),
    listClients({}),
    listTechnicians(),
    getProjectStats(),
  ]);

  const kpis = [
    { label: dict.projects.kpiTotal, value: stats.total, color: "#6d5efc" },
    { label: dict.projects.kpiTasks, value: stats.taskCount, color: "#3b82f6" },
    { label: dict.projects.kpiNoLead, value: stats.withoutLead, color: "#f59e0b" },
    { label: dict.projects.kpiOverdue, value: stats.overdue, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.projects }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{dict.nav.projects}</h1>
        {can(user, "projects.manage") ? (
          <Link href="/projects/new">
            <Button>{dict.projects.new}</Button>
          </Link>
        ) : null}
      </div>

      <StatGrid>
        {kpis.map((k) => (
          <StatCard key={k.label} label={k.label} value={k.value} color={k.color} />
        ))}
      </StatGrid>

      <ProjectsFilters
        statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
        clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
        technicians={technicians}
      />

      <Card>
        {projects.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">{dict.projects.noneFound}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.ref}</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.name}</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.client}</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.lead}</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.status}</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">{dict.projects.colTasks}</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/40">
                  <td className="px-6 py-3">
                    <span className="inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs">
                      {formatProjectReference(p.number)}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <Link href={`/projects/${p.id}`} className="font-medium text-[var(--foreground)] hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-[var(--muted-foreground)]">{p.client?.companyName ?? "—"}</td>
                  <td className="px-6 py-3 text-[var(--muted-foreground)]">
                    {p.lead ? `${p.lead.firstName} ${p.lead.lastName}` : dict.common.unassigned}
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge name={p.status.name} color={p.status.color} />
                  </td>
                  <td className="px-6 py-3 text-[var(--muted-foreground)]">{p._count.tasks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
