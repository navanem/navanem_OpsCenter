import type { Prisma } from "@prisma/client";

export interface ClientFilters {
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
  technicianId?: string;
}

export function buildClientWhere(filters: ClientFilters): Prisma.ClientWhereInput {
  const where: Prisma.ClientWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.technicianId) where.assignedTechnicianId = filters.technicianId;
  if (filters.search) {
    where.OR = [
      { companyName: { contains: filters.search, mode: "insensitive" } },
      { domain: { contains: filters.search, mode: "insensitive" } },
      { contactName: { contains: filters.search, mode: "insensitive" } },
      { contactEmail: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  return where;
}
