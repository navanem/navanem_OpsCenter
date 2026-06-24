import type { Prisma } from "@prisma/client";

export interface TicketFilters {
  search?: string;
  status?: "OPEN" | "IN_PROGRESS" | "PENDING" | "RESOLVED" | "CLOSED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  clientId?: string;
  assigneeId?: string;
}

export function buildTicketWhere(filters: TicketFilters): Prisma.TicketWhereInput {
  const where: Prisma.TicketWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.clientId) where.clientId = filters.clientId;
  if (filters.assigneeId) where.assigneeId = filters.assigneeId;
  if (filters.search) {
    where.subject = { contains: filters.search, mode: "insensitive" };
  }
  return where;
}
