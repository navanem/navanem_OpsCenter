import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { listTickets, getTicketStats } from "@/lib/tickets/queries";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { listTicketCategories, listTicketPriorities } from "@/lib/taxonomies/queries";
import { formatTicketReference, isTicketOverdue } from "@/lib/tickets/meta";
import type { TicketStatusKey } from "@/lib/tickets/meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { StatusBadge, PriorityBadge } from "@/components/tickets/badges";
import { TicketsFilters } from "./tickets-filters";

type SP = { search?: string; status?: string; priorityId?: string; categoryId?: string; clientId?: string; assigneeId?: string };
const STATUSES = ["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"];

export default async function TicketsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePermission("tickets.read");
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status ?? "") ? (sp.status as never) : undefined;

  const [tickets, clients, technicians, priorities, categories, ticketStats] = await Promise.all([
    listTickets({
      search: sp.search,
      status,
      priorityId: sp.priorityId,
      categoryId: sp.categoryId,
      clientId: sp.clientId,
      assigneeId: sp.assigneeId,
    }),
    listClients({}),
    listTechnicians(),
    listTicketPriorities({ activeOnly: true }),
    listTicketCategories({ activeOnly: true }),
    getTicketStats(),
  ]);

  const kpis = [
    { label: "Open", value: ticketStats.open },
    { label: "Overdue", value: ticketStats.overdue },
    { label: "Unassigned (open)", value: ticketStats.unassignedOpen },
    { label: "Total tickets", value: ticketStats.total },
  ];

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent>
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">{k.label}</p>
              <p className="mt-1 text-3xl font-semibold">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <TicketsFilters
        clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
        technicians={technicians}
        priorities={priorities}
        categories={categories}
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
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Due</th>
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
                  <td className="px-6 py-3"><PriorityBadge name={t.priority.name} color={t.priority.color} /></td>
                  <td className="px-6 py-3"><StatusBadge status={t.status as TicketStatusKey} /></td>
                  <td className="px-6 py-3 text-[var(--muted-foreground)]">
                    {t.dueAt ? (
                      <span className={isTicketOverdue(t.dueAt, t.status) ? "font-medium text-[#ef4444]" : ""}>
                        {new Date(t.dueAt).toLocaleDateString()}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
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
