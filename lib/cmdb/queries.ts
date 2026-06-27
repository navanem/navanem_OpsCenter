import { prisma } from "@/lib/db";

const include = {
  type: { select: { id: true, name: true, color: true } },
  status: { select: { id: true, name: true, color: true } },
  client: { select: { id: true, companyName: true } },
  device: { select: { id: true, name: true } },
};

export function listConfigItems(filters: { search?: string; clientId?: string; typeId?: string; statusId?: string } = {}) {
  return prisma.configItem.findMany({
    where: {
      ...(filters.clientId ? { clientId: filters.clientId } : {}),
      ...(filters.typeId ? { typeId: filters.typeId } : {}),
      ...(filters.statusId ? { statusId: filters.statusId } : {}),
      ...(filters.search
        ? { OR: [{ name: { contains: filters.search, mode: "insensitive" as const } }, { description: { contains: filters.search, mode: "insensitive" as const } }] }
        : {}),
    },
    include,
    orderBy: [{ name: "asc" }],
  });
}

export function getConfigItem(id: string) {
  return prisma.configItem.findUnique({
    where: { id },
    include: {
      ...include,
      relatedTo: { select: { id: true, number: true, name: true } },
      relatedFrom: { select: { id: true, number: true, name: true } },
    },
  });
}

export function listConfigItemOptions(excludeId?: string) {
  return prisma.configItem.findMany({
    where: excludeId ? { id: { not: excludeId } } : undefined,
    select: { id: true, number: true, name: true },
    orderBy: { name: "asc" },
  });
}

export function listClientConfigItems(clientId: string) {
  return prisma.configItem.findMany({
    where: { clientId },
    include: { type: { select: { name: true, color: true } }, status: { select: { name: true, color: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getCmdbStats() {
  const [total, byStatus, types] = await Promise.all([
    prisma.configItem.count(),
    prisma.configItem.groupBy({ by: ["statusId"], _count: { _all: true } }),
    prisma.configItem.groupBy({ by: ["typeId"], _count: { _all: true } }),
  ]);
  const linkedToDevices = await prisma.configItem.count({ where: { deviceId: { not: null } } });
  return { total, statuses: byStatus.length, types: types.length, linkedToDevices };
}
