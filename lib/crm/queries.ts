import { prisma } from "@/lib/db";

const oppInclude = {
  stage: { select: { id: true, name: true, color: true } },
  client: { select: { id: true, companyName: true } },
  owner: { select: { id: true, firstName: true, lastName: true } },
};

export function listOpportunities(filters: { search?: string; clientId?: string; stageId?: string; outcome?: string } = {}) {
  return prisma.opportunity.findMany({
    where: {
      ...(filters.clientId ? { clientId: filters.clientId } : {}),
      ...(filters.stageId ? { stageId: filters.stageId } : {}),
      ...(filters.outcome ? { outcome: filters.outcome as "OPEN" | "WON" | "LOST" } : {}),
      ...(filters.search
        ? { OR: [{ name: { contains: filters.search, mode: "insensitive" as const } }, { notes: { contains: filters.search, mode: "insensitive" as const } }] }
        : {}),
    },
    include: oppInclude,
    orderBy: [{ expectedCloseAt: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
  });
}

export function getOpportunity(id: string) {
  return prisma.opportunity.findUnique({ where: { id }, include: oppInclude });
}

export async function getCrmStats() {
  const [openAgg, wonAgg, openCount, wonCount] = await Promise.all([
    prisma.opportunity.aggregate({ where: { outcome: "OPEN" }, _sum: { valueCents: true } }),
    prisma.opportunity.aggregate({ where: { outcome: "WON" }, _sum: { valueCents: true } }),
    prisma.opportunity.count({ where: { outcome: "OPEN" } }),
    prisma.opportunity.count({ where: { outcome: "WON" } }),
  ]);
  const leadCount = await prisma.lead.count({ where: { convertedAt: null } });
  return {
    openValueCents: openAgg._sum.valueCents ?? 0,
    wonValueCents: wonAgg._sum.valueCents ?? 0,
    openCount,
    wonCount,
    leadCount,
  };
}

const leadInclude = {
  source: { select: { id: true, name: true, color: true } },
  status: { select: { id: true, name: true, color: true } },
  owner: { select: { id: true, firstName: true, lastName: true } },
  convertedClient: { select: { id: true, companyName: true } },
};

export function listLeads(filters: { search?: string; statusId?: string; sourceId?: string } = {}) {
  return prisma.lead.findMany({
    where: {
      ...(filters.statusId ? { statusId: filters.statusId } : {}),
      ...(filters.sourceId ? { sourceId: filters.sourceId } : {}),
      ...(filters.search
        ? { OR: [{ companyName: { contains: filters.search, mode: "insensitive" as const } }, { contactName: { contains: filters.search, mode: "insensitive" as const } }, { email: { contains: filters.search, mode: "insensitive" as const } }] }
        : {}),
    },
    include: leadInclude,
    orderBy: [{ convertedAt: { sort: "asc", nulls: "first" } }, { createdAt: "desc" }],
  });
}

export function getLead(id: string) {
  return prisma.lead.findUnique({ where: { id }, include: leadInclude });
}
