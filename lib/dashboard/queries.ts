import { prisma } from "@/lib/db";
import { monthlyEquivalentCents, type BillingCycleKey } from "@/lib/contracts/meta";

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

// Headline counts across the optional modules (rendered per permission/enabled flag).
export async function getModuleCounts() {
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7)); // Monday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const [projects, visitsThisWeek, contracts, devices, kbPublished] = await Promise.all([
    prisma.project.count(),
    prisma.visit.count({ where: { scheduledAt: { gte: weekStart, lt: weekEnd }, status: "SCHEDULED" } }),
    prisma.contract.findMany({ select: { valueCents: true, billingCycle: true } }),
    prisma.device.count(),
    prisma.knowledgeArticle.count({ where: { status: "PUBLISHED" } }),
  ]);
  let contractsMrrCents = 0;
  for (const c of contracts) contractsMrrCents += monthlyEquivalentCents(c.valueCents, c.billingCycle as BillingCycleKey);

  return { projects, visitsThisWeek, contractsMrrCents, devices, kbPublished };
}

// Items needing attention: contracts ending within 30d, device warranties expiring within 60d.
export async function getExpiringSoon() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);
  const in60 = new Date(today);
  in60.setDate(in60.getDate() + 60);

  const [contracts, devices] = await Promise.all([
    prisma.contract.findMany({
      where: { endDate: { gte: today, lte: in30 } },
      select: {
        id: true,
        number: true,
        endDate: true,
        client: { select: { companyName: true } },
        type: { select: { name: true } },
      },
      orderBy: { endDate: "asc" },
      take: 8,
    }),
    prisma.device.findMany({
      where: { warrantyExpiry: { gte: today, lte: in60 } },
      select: {
        id: true,
        number: true,
        name: true,
        warrantyExpiry: true,
        client: { select: { companyName: true } },
      },
      orderBy: { warrantyExpiry: "asc" },
      take: 8,
    }),
  ]);
  return { contracts, devices };
}

// Personal queue for the signed-in user: open tickets, upcoming tasks, upcoming visits.
export async function getMyWork(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [myTickets, myTasks, myVisits] = await Promise.all([
    prisma.ticket.findMany({
      where: { assigneeId: userId, status: { in: ["OPEN", "IN_PROGRESS", "PENDING"] } },
      include: {
        client: { select: { companyName: true } },
        priority: { select: { name: true, color: true } },
      },
      orderBy: [{ dueAt: { sort: "asc", nulls: "last" } }, { updatedAt: "desc" }],
      take: 8,
    }),
    prisma.projectTask.findMany({
      where: { assigneeId: userId, status: { name: { not: "Done" } } },
      include: {
        project: { select: { id: true, name: true } },
        status: { select: { name: true, color: true } },
      },
      orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
      take: 8,
    }),
    prisma.visit.findMany({
      where: { assigneeId: userId, status: "SCHEDULED", scheduledAt: { gte: today } },
      include: {
        type: { select: { name: true, color: true } },
        client: { select: { companyName: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 6,
    }),
  ]);
  return { myTickets, myTasks, myVisits };
}
