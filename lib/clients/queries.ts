import { prisma } from "@/lib/db";
import { monthlyEquivalentCents, type BillingCycleKey } from "@/lib/contracts/meta";
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

// Map of clientId -> monthly recurring revenue (cents), summed across the client's contracts.
export async function getClientMrrCents(): Promise<Record<string, number>> {
  const contracts = await prisma.contract.findMany({
    select: { clientId: true, valueCents: true, billingCycle: true },
  });
  const map: Record<string, number> = {};
  for (const c of contracts) {
    map[c.clientId] = (map[c.clientId] ?? 0) + monthlyEquivalentCents(c.valueCents, c.billingCycle as BillingCycleKey);
  }
  return map;
}

// Map of clientId -> device count, for the clients list.
export async function getClientDeviceCounts(): Promise<Record<string, number>> {
  const groups = await prisma.device.groupBy({
    by: ["clientId"],
    where: { clientId: { not: null } },
    _count: { _all: true },
  });
  const map: Record<string, number> = {};
  for (const g of groups) if (g.clientId) map[g.clientId] = g._count._all;
  return map;
}

export function getClient(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: { assignedTechnician: true, industry: true },
  });
}
