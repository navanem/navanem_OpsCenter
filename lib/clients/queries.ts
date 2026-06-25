import { prisma } from "@/lib/db";
import { buildClientWhere, type ClientFilters } from "./where";

export function listClients(filters: ClientFilters) {
  return prisma.client.findMany({
    where: buildClientWhere(filters),
    include: { assignedTechnician: true },
    orderBy: { companyName: "asc" },
  });
}

export function getClient(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: { assignedTechnician: true, industry: true },
  });
}
