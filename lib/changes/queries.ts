import { prisma } from "@/lib/db";

const include = {
  type: { select: { id: true, name: true, color: true } },
  status: { select: { id: true, name: true, color: true } },
  client: { select: { id: true, companyName: true } },
  assignee: { select: { id: true, firstName: true, lastName: true } },
  approvedBy: { select: { id: true, firstName: true, lastName: true } },
};

export function listChanges(filters: { search?: string; clientId?: string; typeId?: string; statusId?: string } = {}) {
  return prisma.change.findMany({
    where: {
      ...(filters.clientId ? { clientId: filters.clientId } : {}),
      ...(filters.typeId ? { typeId: filters.typeId } : {}),
      ...(filters.statusId ? { statusId: filters.statusId } : {}),
      ...(filters.search
        ? { OR: [{ title: { contains: filters.search, mode: "insensitive" as const } }, { description: { contains: filters.search, mode: "insensitive" as const } }] }
        : {}),
    },
    include,
    orderBy: [{ plannedStart: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
  });
}

export function getChange(id: string) {
  return prisma.change.findUnique({ where: { id }, include });
}

export function listClientChanges(clientId: string) {
  return prisma.change.findMany({
    where: { clientId },
    include: { type: { select: { name: true, color: true } }, status: { select: { name: true, color: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getChangeStats() {
  const [total, byStatus] = await Promise.all([
    prisma.change.count(),
    prisma.change.groupBy({ by: ["statusId"], _count: { _all: true } }),
  ]);
  // Pending approval = changes whose status name is "Pending approval".
  const pendingStatus = await prisma.changeStatus.findFirst({ where: { name: "Pending approval" }, select: { id: true } });
  const pending = pendingStatus ? (byStatus.find((g) => g.statusId === pendingStatus.id)?._count._all ?? 0) : 0;
  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(in7.getDate() + 7);
  const upcoming = await prisma.change.count({ where: { plannedStart: { gte: now, lte: in7 } } });
  const approved = await prisma.change.count({ where: { approvedAt: { not: null } } });
  return { total, pending, upcoming, approved };
}
