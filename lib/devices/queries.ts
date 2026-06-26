import { prisma } from "@/lib/db";

const include = {
  type: { select: { id: true, name: true, color: true } },
  status: { select: { id: true, name: true, color: true } },
  client: { select: { id: true, companyName: true } },
};

export function listDevices(filters: { search?: string; clientId?: string; typeId?: string; statusId?: string } = {}) {
  return prisma.device.findMany({
    where: {
      ...(filters.clientId ? { clientId: filters.clientId } : {}),
      ...(filters.typeId ? { typeId: filters.typeId } : {}),
      ...(filters.statusId ? { statusId: filters.statusId } : {}),
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: "insensitive" as const } },
              { serialNumber: { contains: filters.search, mode: "insensitive" as const } },
              { hostname: { contains: filters.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    include,
    orderBy: { createdAt: "desc" },
  });
}

export function getDevice(id: string) {
  return prisma.device.findUnique({ where: { id }, include });
}

export function listDeviceTickets(deviceId: string) {
  return prisma.ticket.findMany({
    where: { deviceId },
    select: { id: true, number: true, subject: true, status: true },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
}

export function listClientDevices(clientId: string) {
  return prisma.device.findMany({
    where: { clientId },
    include: { type: { select: { name: true, color: true } }, status: { select: { name: true, color: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDeviceStats() {
  const now = new Date();
  const in60 = new Date(now);
  in60.setDate(in60.getDate() + 60);
  const [total, assigned, warrantySoon] = await Promise.all([
    prisma.device.count(),
    prisma.device.count({ where: { clientId: { not: null } } }),
    prisma.device.count({ where: { warrantyExpiry: { gte: now, lte: in60 } } }),
  ]);
  return { total, assigned, unassigned: total - assigned, warrantySoon };
}
