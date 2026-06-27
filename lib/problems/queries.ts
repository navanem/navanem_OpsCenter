import { prisma } from "@/lib/db";

const include = {
  type: { select: { id: true, name: true, color: true } },
  status: { select: { id: true, name: true, color: true } },
  client: { select: { id: true, companyName: true } },
  assignee: { select: { id: true, firstName: true, lastName: true } },
};

export function listProblems(filters: { search?: string; clientId?: string; typeId?: string; statusId?: string } = {}) {
  return prisma.problem.findMany({
    where: {
      ...(filters.clientId ? { clientId: filters.clientId } : {}),
      ...(filters.typeId ? { typeId: filters.typeId } : {}),
      ...(filters.statusId ? { statusId: filters.statusId } : {}),
      ...(filters.search
        ? { OR: [{ title: { contains: filters.search, mode: "insensitive" as const } }, { description: { contains: filters.search, mode: "insensitive" as const } }] }
        : {}),
    },
    include,
    orderBy: { createdAt: "desc" },
  });
}

export function getProblem(id: string) {
  return prisma.problem.findUnique({ where: { id }, include });
}

export async function getProblemStats() {
  const [total, knownErrors, resolved] = await Promise.all([
    prisma.problem.count(),
    prisma.problem.count({ where: { knownError: true } }),
    prisma.problem.count({ where: { resolvedAt: { not: null } } }),
  ]);
  return { total, knownErrors, resolved, open: total - resolved };
}
