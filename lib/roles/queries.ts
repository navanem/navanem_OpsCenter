import { prisma } from "@/lib/db";

export function listRoles() {
  return prisma.role.findMany({
    include: { permissions: true, _count: { select: { users: true } } },
    orderBy: { name: "asc" },
  });
}

export function getRole(id: string) {
  return prisma.role.findUnique({
    where: { id },
    include: { permissions: true },
  });
}
