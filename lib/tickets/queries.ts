import { prisma } from "@/lib/db";
import { buildTicketWhere, type TicketFilters } from "./where";

export function listTickets(filters: TicketFilters) {
  return prisma.ticket.findMany({
    where: buildTicketWhere(filters),
    include: {
      client: { select: { id: true, companyName: true } },
      assignee: { select: { id: true, firstName: true, lastName: true } },
      category: { select: { id: true, name: true, color: true } },
      priority: { select: { id: true, name: true, color: true } },
      tags: { select: { id: true, name: true, color: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getTicketStats() {
  const [byStatus, unassignedOpen, overdue, total] = await Promise.all([
    prisma.ticket.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.ticket.count({
      where: { assigneeId: null, status: { in: ["OPEN", "IN_PROGRESS", "PENDING"] } },
    }),
    prisma.ticket.count({
      where: { dueAt: { lt: new Date() }, status: { in: ["OPEN", "IN_PROGRESS", "PENDING"] } },
    }),
    prisma.ticket.count(),
  ]);
  const map: Record<string, number> = {};
  for (const g of byStatus) map[g.status] = g._count._all;
  const open = (map.OPEN ?? 0) + (map.IN_PROGRESS ?? 0) + (map.PENDING ?? 0);
  return {
    open,
    inProgress: map.IN_PROGRESS ?? 0,
    unassignedOpen,
    overdue,
    total,
  };
}

export function getTicket(id: string) {
  return prisma.ticket.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, companyName: true, domain: true } },
      assignee: { select: { id: true, firstName: true, lastName: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      createdByContact: { select: { id: true, firstName: true, lastName: true } },
      category: { select: { id: true, name: true, color: true } },
      priority: { select: { id: true, name: true, color: true } },
      tags: { select: { id: true, name: true, color: true } },
      comments: {
        include: {
          author: { select: { id: true, firstName: true, lastName: true } },
          authorContact: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      activities: {
        include: { actor: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
