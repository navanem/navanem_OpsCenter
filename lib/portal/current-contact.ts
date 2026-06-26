import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyPortalSession, PORTAL_COOKIE_NAME } from "./session-token";

export interface CurrentContact {
  id: string;
  clientId: string;
  clientName: string;
  firstName: string;
  lastName: string;
  email: string | null;
}

export async function getCurrentContact(): Promise<CurrentContact | null> {
  const store = await cookies();
  const token = store.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifyPortalSession(token);
  if (!session) return null;

  const contact = await prisma.clientContact.findUnique({
    where: { id: session.contactId },
    include: { client: { select: { id: true, companyName: true } } },
  });
  if (!contact || !contact.portalEnabled || !contact.passwordHash) return null;

  return {
    id: contact.id,
    clientId: contact.clientId,
    clientName: contact.client.companyName,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
  };
}

export async function requireContact(): Promise<CurrentContact> {
  const contact = await getCurrentContact();
  if (!contact) redirect("/portal/login");
  return contact;
}
