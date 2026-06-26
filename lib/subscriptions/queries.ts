import { prisma } from "@/lib/db";

const include = {
  type: { select: { id: true, name: true, color: true } },
  status: { select: { id: true, name: true, color: true } },
  client: { select: { id: true, companyName: true } },
};

export function listSubscriptions(filters: { search?: string; clientId?: string; typeId?: string; statusId?: string } = {}) {
  return prisma.subscription.findMany({
    where: {
      ...(filters.clientId ? { clientId: filters.clientId } : {}),
      ...(filters.typeId ? { typeId: filters.typeId } : {}),
      ...(filters.statusId ? { statusId: filters.statusId } : {}),
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: "insensitive" as const } },
              { provider: { contains: filters.search, mode: "insensitive" as const } },
              { reference: { contains: filters.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    include,
    orderBy: [{ renewalDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
  });
}

export function getSubscription(id: string) {
  return prisma.subscription.findUnique({ where: { id }, include });
}

export function listClientSubscriptions(clientId: string) {
  return prisma.subscription.findMany({
    where: { clientId },
    include: { type: { select: { name: true, color: true } }, status: { select: { name: true, color: true } } },
    orderBy: [{ renewalDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
  });
}

export async function getSubscriptionStats() {
  const now = new Date();
  const in30 = new Date(now);
  in30.setDate(in30.getDate() + 30);
  const [total, assigned, renewingSoon, all] = await Promise.all([
    prisma.subscription.count(),
    prisma.subscription.count({ where: { clientId: { not: null } } }),
    prisma.subscription.count({ where: { renewalDate: { gte: now, lte: in30 } } }),
    prisma.subscription.findMany({ select: { costCents: true, billingCycle: true } }),
  ]);
  // Monthly recurring equivalent across all subscriptions.
  let monthlyRecurringCents = 0;
  for (const s of all) {
    const c = s.costCents ?? 0;
    if (s.billingCycle === "MONTHLY") monthlyRecurringCents += c;
    else if (s.billingCycle === "QUARTERLY") monthlyRecurringCents += Math.round(c / 3);
    else if (s.billingCycle === "YEARLY") monthlyRecurringCents += Math.round(c / 12);
    // ONE_OFF contributes nothing to recurring.
  }
  return { total, assigned, unassigned: total - assigned, renewingSoon, monthlyRecurringCents };
}

// Subscriptions renewing within `days`, for the dashboard attention section.
export function listSubscriptionsRenewingSoon(days = 30) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + days);
  return prisma.subscription.findMany({
    where: { renewalDate: { gte: today, lte: horizon } },
    select: {
      id: true,
      number: true,
      name: true,
      renewalDate: true,
      client: { select: { companyName: true } },
    },
    orderBy: { renewalDate: "asc" },
    take: 8,
  });
}
