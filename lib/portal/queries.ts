import { prisma } from "@/lib/db";

// Tickets are always scoped to the contact's own client.
export function listPortalTickets(clientId: string) {
  return prisma.ticket.findMany({
    where: { clientId },
    include: {
      priority: { select: { id: true, name: true, color: true } },
      category: { select: { id: true, name: true, color: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export function getPortalTicket(id: string, clientId: string) {
  return prisma.ticket.findFirst({
    where: { id, clientId },
    include: {
      priority: { select: { id: true, name: true, color: true } },
      category: { select: { id: true, name: true, color: true } },
      assignee: { select: { firstName: true, lastName: true } },
      comments: {
        include: {
          author: { select: { firstName: true, lastName: true } },
          authorContact: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
