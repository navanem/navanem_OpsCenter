import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { listProjects } from "@/lib/projects/queries";
import { listProjectStatuses } from "@/lib/taxonomies/queries";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { formatProjectReference } from "@/lib/projects/meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { StatusBadge } from "@/components/projects/badges";
import { ProjectsFilters } from "./projects-filters";

type SP = { search?: string; statusId?: string; clientId?: string; leadId?: string };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePermission("projects.read");
  const sp = await searchParams;

  const [projects, statuses, clients, technicians] = await Promise.all([
    listProjects({
      search: sp.search,
      statusId: sp.statusId,
      clientId: sp.clientId,
      leadId: sp.leadId,
    }),
    listProjectStatuses({ activeOnly: true }),
    listClients({}),
    listTechnicians(),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Projects" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        {can(user, "projects.manage") ? (
          <Link href="/projects/new">
            <Button>New project</Button>
          </Link>
        ) : null}
      </div>

      <ProjectsFilters
        statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
        clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
        technicians={technicians}
      />

      <Card>
        {projects.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">No projects found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Ref</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Name</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Client</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Lead</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Status</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Tasks</th>
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
                    {p.lead ? `${p.lead.firstName} ${p.lead.lastName}` : "Unassigned"}
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
