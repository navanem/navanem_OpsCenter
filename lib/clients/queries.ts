import { prisma } from "@/lib/db";
import { buildClientWhere, type ClientFilters } from "./where";

export function listClients(filters: ClientFilters) {
  return prisma.client.findMany({
    where: buildClientWhere(filters),
    include: { assignedTechnician: true },
    orderBy: { companyName: "asc" },
  });
}

export async function getClientStats() {
  const [total, active, unassigned] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { status: "ACTIVE" } }),
    prisma.client.count({ where: { assignedTechnicianId: null } }),
  ]);
  return { total, active, unassigned };
}

// Map of clientId -> open ticket count, for the clients list.
export async function getClientOpenTicketCounts(): Promise<Record<string, number>> {
  const groups = await prisma.ticket.groupBy({
    by: ["clientId"],
    where: { status: { in: ["OPEN", "IN_PROGRESS", "PENDING"] } },
    _count: { _all: true },
  });
  const map: Record<string, number> = {};
  for (const g of groups) map[g.clientId] = g._count._all;
  return map;
}

export function getClient(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: { assignedTechnician: true, industry: true },
  });
}
