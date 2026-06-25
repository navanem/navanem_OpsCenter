import { prisma } from "@/lib/db";

export function listClientContacts(clientId: string) {
  return prisma.clientContact.findMany({
    where: { clientId },
    orderBy: [{ isVip: "desc" }, { lastName: "asc" }, { firstName: "asc" }],
  });
}

export function getContact(id: string) {
  return prisma.clientContact.findUnique({ where: { id } });
}
