import { prisma } from "@/lib/db";

const order = [{ sortOrder: "asc" as const }, { name: "asc" as const }];

export function listTicketCategories(opts?: { activeOnly?: boolean }) {
  return prisma.ticketCategory.findMany({
    where: opts?.activeOnly ? { isActive: true } : undefined,
    orderBy: order,
  });
}

export function listTicketPriorities(opts?: { activeOnly?: boolean }) {
  return prisma.ticketPriority.findMany({
    where: opts?.activeOnly ? { isActive: true } : undefined,
    orderBy: order,
  });
}

export function listClientIndustries(opts?: { activeOnly?: boolean }) {
  return prisma.clientIndustry.findMany({
    where: opts?.activeOnly ? { isActive: true } : undefined,
    orderBy: order,
  });
}

export function getTicketCategory(id: string) {
  return prisma.ticketCategory.findUnique({ where: { id } });
}

export function getTicketPriority(id: string) {
  return prisma.ticketPriority.findUnique({ where: { id } });
}

export function getClientIndustry(id: string) {
  return prisma.clientIndustry.findUnique({ where: { id } });
}

export function listProjectStatuses(opts?: { activeOnly?: boolean }) {
  return prisma.projectStatus.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function listProjectTaskStatuses(opts?: { activeOnly?: boolean }) {
  return prisma.projectTaskStatus.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function getProjectStatus(id: string) {
  return prisma.projectStatus.findUnique({ where: { id } });
}

export function getProjectTaskStatus(id: string) {
  return prisma.projectTaskStatus.findUnique({ where: { id } });
}
