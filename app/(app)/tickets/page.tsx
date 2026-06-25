import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { listTickets } from "@/lib/tickets/queries";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { formatTicketReference } from "@/lib/tickets/meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { StatusBadge, PriorityBadge } from "@/components/tickets/badges";
import { TicketsFilters } from "./tickets-filters";

type SP = { search?: string; status?: string; priority?: string; clientId?: string; assigneeId?: string };
const STATUSES = ["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default async function TicketsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePermission("tickets.read");
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status ?? "") ? (sp.status as never) : undefined;
  const priority = PRIORITIES.includes(sp.priority ?? "") ? (sp.priority as never) : undefined;

  const [tickets, clients, technicians] = await Promise.all([
    listTickets({ search: sp.search, status, priority, clientId: sp.clientId, assigneeId: sp.assigneeId }),
    listClients({}),
    listTechnicians(),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Tickets" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Tickets</h1>
        <div className="flex gap-2">
          <Link href="/tickets/board"><Button variant="outline">Board view</Button></Link>
          {can(user, "tickets.manage") ? <Link href="/tickets/new"><Button>New ticket</Button></Link> : null}
        </div>
      </div>

      <TicketsFilters
        clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
        technicians={technicians}
      />

      <Card>
        {tickets.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">No tickets found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Ref</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Subject</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Client</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Priority</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Status</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/40">
                  <td className="px-6 py-3">
                    <span className="inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs">{formatTicketReference(t.number)}</span>
                  </td>
                  <td className="px-6 py-3">
                    <Link href={`/tickets/${t.id}`} className="font-medium text-[var(--foreground)] hover:underline">{t.subject}</Link>
                  </td>
                  <td className="px-6 py-3 text-[var(--muted-foreground)]">{t.client.companyName}</td>
                  <td className="px-6 py-3"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-6 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-6 py-3 text-[var(--muted-foreground)]">
                    {t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : "Unassigned"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
