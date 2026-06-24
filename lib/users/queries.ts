import { prisma } from "@/lib/db";

export function listTechnicians() {
  return prisma.user.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    select: { id: true, firstName: true, lastName: true, email: true },
  });
}
