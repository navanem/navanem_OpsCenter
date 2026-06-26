import { prisma } from "@/lib/db";

const include = {
  user: { select: { id: true, firstName: true, lastName: true } },
  ticket: { select: { id: true, number: true, subject: true } },
  task: { select: { id: true, title: true } },
  visit: { select: { id: true, title: true } },
  client: { select: { id: true, companyName: true } },
  approvedBy: { select: { id: true, firstName: true, lastName: true } },
};

type StatusFilter = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface TimeEntryFilters {
  userId?: string;
  status?: StatusFilter;
  from?: Date;
  to?: Date;
  ticketId?: string;
  taskId?: string;
  visitId?: string;
  clientId?: string;
}

export function listTimeEntries(filters: TimeEntryFilters = {}) {
  const dateFilter =
    filters.from || filters.to
      ? {
          ...(filters.from ? { gte: filters.from } : {}),
          ...(filters.to ? { lt: filters.to } : {}),
        }
      : undefined;
  return prisma.timeEntry.findMany({
    where: {
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.ticketId ? { ticketId: filters.ticketId } : {}),
      ...(filters.taskId ? { taskId: filters.taskId } : {}),
      ...(filters.visitId ? { visitId: filters.visitId } : {}),
      ...(filters.clientId ? { clientId: filters.clientId } : {}),
      ...(dateFilter ? { date: dateFilter } : {}),
    },
    include,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

export function getTimeEntry(id: string) {
  return prisma.timeEntry.findUnique({ where: { id }, include });
}

export async function getTimeStats(filters: { userId?: string } = {}) {
  const where = filters.userId ? { userId: filters.userId } : {};
  const [agg, billableAgg, byStatus] = await Promise.all([
    prisma.timeEntry.aggregate({ where, _sum: { minutes: true } }),
    prisma.timeEntry.aggregate({ where: { ...where, billable: true }, _sum: { minutes: true } }),
    prisma.timeEntry.groupBy({ by: ["status"], where, _count: { _all: true } }),
  ]);
  const statusMap: Record<string, number> = {};
  for (const g of byStatus) statusMap[g.status] = g._count._all;
  return {
    totalMinutes: agg._sum.minutes ?? 0,
    billableMinutes: billableAgg._sum.minutes ?? 0,
    draft: statusMap.DRAFT ?? 0,
    submitted: statusMap.SUBMITTED ?? 0,
    approved: statusMap.APPROVED ?? 0,
    rejected: statusMap.REJECTED ?? 0,
  };
}

// Entries for a client over a period (for the monthly client report). Excludes rejected.
export function listClientReportEntries(clientId: string, from: Date, to: Date) {
  return prisma.timeEntry.findMany({
    where: { clientId, date: { gte: from, lt: to }, status: { not: "REJECTED" } },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
      ticket: { select: { id: true, number: true, subject: true } },
      task: { select: { id: true, title: true } },
      visit: { select: { id: true, title: true } },
    },
    orderBy: { date: "asc" },
  });
}

export function getRunningTimer(userId: string) {
  return prisma.timeTimer.findUnique({
    where: { userId },
    include: {
      ticket: { select: { id: true, number: true, subject: true } },
      task: { select: { id: true, title: true } },
      visit: { select: { id: true, title: true } },
      client: { select: { id: true, companyName: true } },
    },
  });
}
