import { prisma } from "@/lib/db";

const oppInclude = {
  stage: { select: { id: true, name: true, color: true } },
  client: { select: { id: true, companyName: true, contactEmail: true } },
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
  const now = new Date();
  const [openAgg, wonAgg, openCount, wonCount, openDeals, overdueCount] = await Promise.all([
    prisma.opportunity.aggregate({ where: { outcome: "OPEN" }, _sum: { valueCents: true } }),
    prisma.opportunity.aggregate({ where: { outcome: "WON" }, _sum: { valueCents: true } }),
    prisma.opportunity.count({ where: { outcome: "OPEN" } }),
    prisma.opportunity.count({ where: { outcome: "WON" } }),
    prisma.opportunity.findMany({ where: { outcome: "OPEN" }, select: { valueCents: true, probability: true } }),
    prisma.opportunity.count({ where: { outcome: "OPEN", expectedCloseAt: { lt: now } } }),
  ]);
  const leadCount = await prisma.lead.count({ where: { convertedAt: null } });
  // Weighted forecast = Σ value × probability over open deals (probability defaults to 100% when unset).
  const weightedForecastCents = openDeals.reduce(
    (sum, o) => sum + Math.round((o.valueCents ?? 0) * ((o.probability ?? 100) / 100)),
    0,
  );
  return {
    openValueCents: openAgg._sum.valueCents ?? 0,
    wonValueCents: wonAgg._sum.valueCents ?? 0,
    weightedForecastCents,
    openCount,
    wonCount,
    overdueCount,
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

// Sales analytics: win rate, average deal size & sales cycle, and the open
// pipeline distribution across stages.
export async function getCrmAnalytics() {
  const [wonDeals, lostCount, openDeals, stages] = await Promise.all([
    prisma.opportunity.findMany({ where: { outcome: "WON" }, select: { valueCents: true, createdAt: true, closedAt: true } }),
    prisma.opportunity.count({ where: { outcome: "LOST" } }),
    prisma.opportunity.findMany({ where: { outcome: "OPEN" }, select: { stageId: true, valueCents: true } }),
    prisma.opportunityStage.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, color: true } }),
  ]);

  const wonCount = wonDeals.length;
  const closedCount = wonCount + lostCount;
  const winRate = closedCount > 0 ? wonCount / closedCount : 0;

  const wonWithValue = wonDeals.filter((d) => d.valueCents != null);
  const wonValueCents = wonWithValue.reduce((s, d) => s + (d.valueCents ?? 0), 0);
  const avgWonDealCents = wonWithValue.length > 0 ? Math.round(wonValueCents / wonWithValue.length) : 0;

  const cycles = wonDeals
    .filter((d) => d.closedAt != null)
    .map((d) => (new Date(d.closedAt as Date).getTime() - new Date(d.createdAt).getTime()) / 86_400_000);
  const avgSalesCycleDays = cycles.length > 0 ? Math.round(cycles.reduce((s, c) => s + c, 0) / cycles.length) : 0;

  const byStage = stages.map((st) => {
    const deals = openDeals.filter((d) => d.stageId === st.id);
    return {
      id: st.id,
      name: st.name,
      color: st.color,
      count: deals.length,
      valueCents: deals.reduce((s, d) => s + (d.valueCents ?? 0), 0),
    };
  });
  const unstaged = openDeals.filter((d) => !d.stageId);
  if (unstaged.length > 0) {
    byStage.push({
      id: "__unstaged__",
      name: "",
      color: "#6b7280",
      count: unstaged.length,
      valueCents: unstaged.reduce((s, d) => s + (d.valueCents ?? 0), 0),
    });
  }

  return {
    wonCount,
    lostCount,
    openCount: openDeals.length,
    winRate,
    avgWonDealCents,
    avgSalesCycleDays,
    wonValueCents,
    byStage,
  };
}

// Lightweight CRM summary for the dashboard: open pipeline value and the open
// deals that need attention (overdue or closing within the next 14 days).
export async function getCrmDashboard() {
  const now = new Date();
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + 14);
  const [openAgg, attention] = await Promise.all([
    prisma.opportunity.aggregate({ where: { outcome: "OPEN" }, _sum: { valueCents: true } }),
    prisma.opportunity.findMany({
      where: { outcome: "OPEN", expectedCloseAt: { not: null, lte: horizon } },
      select: {
        id: true,
        number: true,
        name: true,
        valueCents: true,
        expectedCloseAt: true,
        client: { select: { companyName: true } },
        stage: { select: { name: true, color: true } },
      },
      orderBy: { expectedCloseAt: "asc" },
      take: 6,
    }),
  ]);
  return { openValueCents: openAgg._sum.valueCents ?? 0, attention };
}
