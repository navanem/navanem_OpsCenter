import { prisma } from "@/lib/db";
import { monthlyEquivalentCents, type BillingCycleKey } from "@/lib/contracts/meta";

const include = {
  client: { select: { id: true, companyName: true } },
  type: { select: { id: true, name: true, color: true, defaultHourlyRateCents: true } },
  status: { select: { id: true, name: true, color: true } },
};

export function listContracts(filters: { clientId?: string; statusId?: string; typeId?: string } = {}) {
  return prisma.contract.findMany({
    where: {
      ...(filters.clientId ? { clientId: filters.clientId } : {}),
      ...(filters.statusId ? { statusId: filters.statusId } : {}),
      ...(filters.typeId ? { typeId: filters.typeId } : {}),
    },
    include,
    orderBy: { createdAt: "desc" },
  });
}

export function getContract(id: string) {
  return prisma.contract.findUnique({ where: { id }, include });
}

export async function getContractStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);
  const [total, expiringSoon, all] = await Promise.all([
    prisma.contract.count(),
    prisma.contract.count({ where: { endDate: { gte: today, lte: in30 } } }),
    prisma.contract.findMany({ select: { valueCents: true, billingCycle: true } }),
  ]);
  let monthlyRecurringCents = 0;
  let totalValueCents = 0;
  for (const c of all) {
    monthlyRecurringCents += monthlyEquivalentCents(c.valueCents, c.billingCycle as BillingCycleKey);
    totalValueCents += c.valueCents ?? 0;
  }
  return { total, expiringSoon, monthlyRecurringCents, totalValueCents };
}

// The client's current contract (not yet expired), used to inherit a default hourly rate.
export function getClientActiveContract(clientId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return prisma.contract.findFirst({
    where: { clientId, OR: [{ endDate: null }, { endDate: { gte: today } }] },
    include: { type: { select: { defaultHourlyRateCents: true } } },
    orderBy: [{ startDate: "desc" }],
  });
}
