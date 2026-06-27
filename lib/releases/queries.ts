import { prisma } from "@/lib/db";

const include = {
  type: { select: { id: true, name: true, color: true } },
  status: { select: { id: true, name: true, color: true } },
  client: { select: { id: true, companyName: true } },
  owner: { select: { id: true, firstName: true, lastName: true } },
};

export function listReleases(filters: { search?: string; clientId?: string; typeId?: string; statusId?: string } = {}) {
  return prisma.release.findMany({
    where: {
      ...(filters.clientId ? { clientId: filters.clientId } : {}),
      ...(filters.typeId ? { typeId: filters.typeId } : {}),
      ...(filters.statusId ? { statusId: filters.statusId } : {}),
      ...(filters.search
        ? { OR: [{ name: { contains: filters.search, mode: "insensitive" as const } }, { version: { contains: filters.search, mode: "insensitive" as const } }, { description: { contains: filters.search, mode: "insensitive" as const } }] }
        : {}),
    },
    include,
    orderBy: [{ plannedDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
  });
}

export function getRelease(id: string) {
  return prisma.release.findUnique({ where: { id }, include });
}

export async function getReleaseStats() {
  const now = new Date();
  const in30 = new Date(now);
  in30.setDate(in30.getDate() + 30);
  const [total, released, upcoming] = await Promise.all([
    prisma.release.count(),
    prisma.release.count({ where: { releasedDate: { not: null } } }),
    prisma.release.count({ where: { releasedDate: null, plannedDate: { gte: now, lte: in30 } } }),
  ]);
  return { total, released, upcoming, planned: total - released };
}
