"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { acceptInviteSchema } from "@/lib/validation/user";
import { hashInviteToken } from "@/lib/auth/invite-token";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";

export interface AcceptState {
  error?: string;
}

export async function acceptInviteAction(
  _prev: AcceptState,
  formData: FormData,
): Promise<AcceptState> {
  const token = formData.get("token");
  if (typeof token !== "string" || token.length === 0) {
    return { error: "Invalid invitation." };
  }
  const parsed = acceptInviteSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash: hashInviteToken(token) },
    include: { user: true },
  });
  if (
    !invitation ||
    invitation.status !== "PENDING" ||
    invitation.expiresAt < new Date() ||
    !invitation.userId
  ) {
    return { error: "This invitation is invalid or has expired." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: invitation.userId },
      data: { passwordHash, status: "ACTIVE" },
    }),
    prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    }),
  ]);

  await setSessionCookie({ userId: invitation.userId, email: invitation.user!.email });
  redirect("/dashboard");
}
