import { prisma } from "@/lib/db";

export function listUsers() {
  return prisma.user.findMany({
    include: {
      role: true,
      invitations: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });
}

export function getUser(id: string) {
  return prisma.user.findUnique({ where: { id }, include: { role: true } });
}

export function countActiveAdmins() {
  return prisma.user.count({
    where: { status: "ACTIVE", role: { isSystem: true } },
  });
}

export function listTechnicians() {
  return prisma.user.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    select: { id: true, firstName: true, lastName: true, email: true },
  });
}
