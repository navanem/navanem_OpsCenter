import { prisma } from "@/lib/db";
import { buildTicketWhere, type TicketFilters } from "./where";

export function listTickets(filters: TicketFilters) {
  return prisma.ticket.findMany({
    where: buildTicketWhere(filters),
    include: {
      client: { select: { id: true, companyName: true } },
      assignee: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export function getTicket(id: string) {
  return prisma.ticket.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, companyName: true, domain: true } },
      assignee: { select: { id: true, firstName: true, lastName: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      comments: {
        include: { author: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: "asc" },
      },
      activities: {
        include: { actor: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
