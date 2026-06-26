"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { decryptSecret } from "@/lib/crypto/secret";
import { verifyTotp } from "@/lib/auth/totp";
import { consumeBackupCode } from "@/lib/auth/backup-codes";
import { setSessionCookie } from "@/lib/auth/session";
import { readTotpChallenge, clearTotpChallengeCookie } from "@/lib/auth/totp-challenge";

export interface VerifyState {
  error?: string;
}

export async function verifyLoginTotpAction(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const userId = await readTotpChallenge();
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== "ACTIVE" || !user.totpEnabled || !user.totpSecret) {
    await clearTotpChallengeCookie();
    redirect("/login");
  }

  const secret = decryptSecret(user!.totpSecret!);
  const code = formData.get("code");
  if (!secret || typeof code !== "string") {
    return { error: "That code is not valid. Try again." };
  }

  if (verifyTotp(secret, code)) {
    // valid authenticator code
  } else {
    // fall back to a one-time backup code
    const remaining = consumeBackupCode(code, user!.totpBackupCodes);
    if (!remaining) return { error: "That code is not valid. Try again." };
    await prisma.user.update({ where: { id: user!.id }, data: { totpBackupCodes: remaining } });
  }

  await clearTotpChallengeCookie();
  await setSessionCookie({ userId: user!.id, email: user!.email });
  redirect("/dashboard");
}
