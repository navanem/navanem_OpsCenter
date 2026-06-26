"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { acceptInviteSchema } from "@/lib/validation/user";
import { hashPortalToken } from "@/lib/portal/token";
import { hashPassword } from "@/lib/auth/password";

export interface PortalSetState {
  error?: string;
}

export async function portalSetPasswordAction(
  _prev: PortalSetState,
  formData: FormData,
): Promise<PortalSetState> {
  const token = formData.get("token");
  if (typeof token !== "string" || token.length === 0) return { error: "Invalid link." };
  const parsed = acceptInviteSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const record = await prisma.portalToken.findUnique({ where: { tokenHash: hashPortalToken(token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: "This link is invalid or has expired." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.$transaction([
    prisma.clientContact.update({
      where: { id: record.contactId },
      data: { passwordHash, portalEnabled: true },
    }),
    prisma.portalToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.portalToken.updateMany({
      where: { contactId: record.contactId, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);

  redirect("/portal/login?set=1");
}
