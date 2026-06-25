import { prisma } from "@/lib/db";

export async function getDashboardStats() {
  const [clientsTotal, clientsActive, usersTotal, statusGroups, recentTickets] =
    await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { status: "ACTIVE" } }),
      prisma.user.count(),
      prisma.ticket.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.ticket.findMany({
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: {
          client: { select: { companyName: true } },
          priority: { select: { name: true, color: true } },
        },
      }),
    ]);

  const byStatus: Record<string, number> = {};
  for (const g of statusGroups) byStatus[g.status] = g._count._all;
  const ticketsTotal = Object.values(byStatus).reduce((a, b) => a + b, 0);
  const openTickets =
    (byStatus.OPEN ?? 0) + (byStatus.IN_PROGRESS ?? 0) + (byStatus.PENDING ?? 0);

  return {
    clientsTotal,
    clientsActive,
    usersTotal,
    ticketsTotal,
    openTickets,
    byStatus,
    recentTickets,
  };
}
