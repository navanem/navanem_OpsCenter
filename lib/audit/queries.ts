import { prisma } from "@/lib/db";

export interface AuditFilters {
  entityType?: string;
  action?: string;
  search?: string;
  skip?: number;
  take?: number;
}

export function listAuditLogs(filters: AuditFilters = {}) {
  return prisma.auditLog.findMany({
    where: {
      ...(filters.entityType ? { entityType: filters.entityType } : {}),
      ...(filters.action ? { action: filters.action } : {}),
      ...(filters.search
        ? {
            OR: [
              { summary: { contains: filters.search, mode: "insensitive" as const } },
              { actorName: { contains: filters.search, mode: "insensitive" as const } },
              { entityLabel: { contains: filters.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    skip: filters.skip ?? 0,
    take: filters.take ?? 50,
  });
}

export function countAuditLogs(filters: AuditFilters = {}) {
  return prisma.auditLog.count({
    where: {
      ...(filters.entityType ? { entityType: filters.entityType } : {}),
      ...(filters.action ? { action: filters.action } : {}),
      ...(filters.search
        ? {
            OR: [
              { summary: { contains: filters.search, mode: "insensitive" as const } },
              { actorName: { contains: filters.search, mode: "insensitive" as const } },
              { entityLabel: { contains: filters.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
  });
}

// Distinct entity types & actions present, for filter dropdowns.
export async function auditFacets() {
  const [types, actions] = await Promise.all([
    prisma.auditLog.findMany({ distinct: ["entityType"], select: { entityType: true }, orderBy: { entityType: "asc" } }),
    prisma.auditLog.findMany({ distinct: ["action"], select: { action: true }, orderBy: { action: "asc" } }),
  ]);
  return { types: types.map((t) => t.entityType), actions: actions.map((a) => a.action) };
}
