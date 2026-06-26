import type { Prisma } from "@prisma/client";

export interface ProjectFilters {
  search?: string;
  statusId?: string;
  clientId?: string;
  leadId?: string;
}

export function buildProjectWhere(filters: ProjectFilters): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {};
  if (filters.statusId) where.statusId = filters.statusId;
  if (filters.clientId) where.clientId = filters.clientId;
  if (filters.leadId) where.leadId = filters.leadId;
  if (filters.search) where.name = { contains: filters.search, mode: "insensitive" };
  return where;
}
