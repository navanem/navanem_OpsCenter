import type { Prisma } from "@prisma/client";

export interface TicketFilters {
  search?: string;
  status?: "OPEN" | "IN_PROGRESS" | "PENDING" | "RESOLVED" | "CLOSED";
  priorityId?: string;
  categoryId?: string;
  clientId?: string;
  assigneeId?: string;
  tagId?: string;
}

export function buildTicketWhere(filters: TicketFilters): Prisma.TicketWhereInput {
  const where: Prisma.TicketWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.priorityId) where.priorityId = filters.priorityId;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.clientId) where.clientId = filters.clientId;
  if (filters.assigneeId) where.assigneeId = filters.assigneeId;
  if (filters.tagId) where.tags = { some: { id: filters.tagId } };
  if (filters.search) where.subject = { contains: filters.search, mode: "insensitive" };
  return where;
}
