import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { listTickets, getTicketStats } from "@/lib/tickets/queries";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { listTicketCategories, listTicketPriorities, listTicketTags, listTicketTypes } from "@/lib/taxonomies/queries";
import { formatTicketReference, isTicketOverdue } from "@/lib/tickets/meta";
import type { TicketStatusKey } from "@/lib/tickets/meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { StatusBadge, PriorityBadge } from "@/components/tickets/badges";
import { getDictionary } from "@/lib/i18n/server";
import { TicketsFilters } from "./tickets-filters";

type SP = { search?: string; status?: string; priorityId?: string; categoryId?: string; clientId?: string; assigneeId?: string; tagId?: string; ticketTypeId?: string };
const STATUSES = ["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"];

export default async function TicketsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePermission("tickets.read");
  const [sp, dict] = await Promise.all([searchParams, getDictionary()]);
  const status = STATUSES.includes(sp.status ?? "") ? (sp.status as never) : undefined;

  const [tickets, clients, technicians, priorities, categories, tags, types, ticketStats] = await Promise.all([
    listTickets({
      search: sp.search,
      status,
      priorityId: sp.priorityId,
      categoryId: sp.categoryId,
      clientId: sp.clientId,
      assigneeId: sp.assigneeId,
      tagId: sp.tagId,
      ticketTypeId: sp.ticketTypeId,
    }),
    listClients({}),
    listTechnicians(),
    listTicketPriorities({ activeOnly: true }),
    listTicketCategories({ activeOnly: true }),
    listTicketTags({ activeOnly: true }),
    listTicketTypes({ activeOnly: true }),
    getTicketStats(),
  ]);

  const kpis = [
    { label: dict.tickets.kpiOpen, value: ticketStats.open, color: "#3b82f6" },
    { label: dict.tickets.kpiOverdue, value: ticketStats.overdue, color: "#ef4444" },
    { label: dict.tickets.kpiUnassignedOpen, value: ticketStats.unassignedOpen, color: "#f59e0b" },
    { label: dict.tickets.kpiTotal, value: ticketStats.total, color: "#6d5efc" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.tickets }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{dict.nav.tickets}</h1>
        <div className="flex gap-2">
          <a href="/api/export?type=tickets" download><Button variant="outline">{dict.common.exportCsv}</Button></a>
          <Link href="/tickets/board"><Button variant="outline">{dict.tickets.boardView}</Button></Link>
          {can(user, "tickets.manage") ? <Link href="/tickets/new"><Button>{dict.tickets.new}</Button></Link> : null}
        </div>
      </div>

      <StatGrid>
        {kpis.map((k) => (
          <StatCard key={k.label} label={k.label} value={k.value} color={k.color} />
        ))}
      </StatGrid>

      <TicketsFilters
        clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
        technicians={technicians}
        priorities={priorities}
        categories={categories}
        types={types.map((t) => ({ id: t.id, name: t.name }))}
        tags={tags.map((t) => ({ id: t.id, name: t.name }))}
      />

      <Card>
        {tickets.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">{dict.tickets.noneFound}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.ref}</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.subject}</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.client}</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.priority}</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.status}</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.due}</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.assignee}</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/40">
                  <td className="px-6 py-3">
                    <span className="inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs">{formatTicketReference(t.number)}</span>
                  </td>
                  <td className="px-6 py-3">
                    {t.ticketType ? (
                      <span className="mr-2 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium align-middle" style={{ backgroundColor: `${t.ticketType.color}22`, color: t.ticketType.color }}>
                        {t.ticketType.name}
                      </span>
                    ) : null}
                    <Link href={`/tickets/${t.id}`} className="font-medium text-[var(--foreground)] hover:underline">{t.subject}</Link>
                    {t.tags.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {t.tags.map((tag) => (
                          <span key={tag.id} className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: `${tag.color}22`, color: tag.color }}>
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-3 text-[var(--muted-foreground)]">{t.client.companyName}</td>
                  <td className="px-6 py-3"><PriorityBadge name={t.priority.name} color={t.priority.color} /></td>
                  <td className="px-6 py-3"><StatusBadge status={t.status as TicketStatusKey} label={dict.ticketStatus[t.status as TicketStatusKey]} /></td>
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
                    {t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : dict.common.unassigned}
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
