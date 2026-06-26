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

// Knowledge articles exposed to clients: published AND flagged visible-to-portal.
export function listPortalArticles(search?: string) {
  return prisma.knowledgeArticle.findMany({
    where: {
      status: "PUBLISHED",
      visibleToPortal: true,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { body: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      excerpt: true,
      updatedAt: true,
      category: { select: { name: true, color: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export function getPortalArticle(id: string) {
  return prisma.knowledgeArticle.findFirst({
    where: { id, status: "PUBLISHED", visibleToPortal: true },
    select: {
      id: true,
      title: true,
      body: true,
      updatedAt: true,
      category: { select: { name: true, color: true } },
    },
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
