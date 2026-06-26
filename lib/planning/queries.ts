import { prisma } from "@/lib/db";

export function listVisitsInRange(opts: { from: Date; to: Date; assigneeId?: string; typeId?: string }) {
  return prisma.visit.findMany({
    where: {
      scheduledAt: { gte: opts.from, lt: opts.to },
      ...(opts.assigneeId ? { assigneeId: opts.assigneeId } : {}),
      ...(opts.typeId ? { typeId: opts.typeId } : {}),
    },
    include: {
      type: { select: { id: true, name: true, color: true } },
      client: { select: { id: true, companyName: true } },
      assignee: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export function listClientVisits(clientId: string, opts?: { from?: Date; take?: number }) {
  return prisma.visit.findMany({
    where: {
      clientId,
      ...(opts?.from ? { scheduledAt: { gte: opts.from } } : {}),
    },
    include: {
      type: { select: { id: true, name: true, color: true } },
      assignee: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { scheduledAt: "asc" },
    take: opts?.take ?? 20,
  });
}

export function getVisit(id: string) {
  return prisma.visit.findUnique({
    where: { id },
    include: {
      type: { select: { id: true, name: true, color: true } },
      client: { select: { id: true, companyName: true } },
      assignee: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export function listRecurringVisits() {
  return prisma.recurringVisit.findMany({
    include: {
      type: { select: { id: true, name: true, color: true } },
      client: { select: { id: true, companyName: true } },
      assignee: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { visits: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getRecurringVisit(id: string) {
  return prisma.recurringVisit.findUnique({ where: { id } });
}
