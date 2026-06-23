import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifySession, SESSION_COOKIE_NAME } from "./session-token";
import type { AuthUser } from "@/lib/rbac/can";

export interface CurrentUser extends AuthUser {
  firstName: string;
  lastName: string;
  roleName: string;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifySession(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { role: { include: { permissions: true } } },
  });
  if (!user || user.status !== "ACTIVE") return null;

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roleName: user.role.name,
    permissions: user.role.permissions.map((p) => p.key),
  };
}
