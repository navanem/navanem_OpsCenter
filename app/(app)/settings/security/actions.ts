"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guard";
import { encryptSecret, decryptSecret } from "@/lib/crypto/secret";
import { newTotpSecret, verifyTotp } from "@/lib/auth/totp";

export interface TotpState {
  error?: string;
}

// Step 1: generate and store an unconfirmed secret, then show the QR to scan.
export async function beginTotpSetupAction(): Promise<void> {
  const user = await requireUser();
  const secret = newTotpSecret();
  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: encryptSecret(secret), totpEnabled: false },
  });
  revalidatePath("/settings/security");
  redirect("/settings/security");
}

export async function cancelTotpSetupAction(): Promise<void> {
  const user = await requireUser();
  await prisma.user.update({ where: { id: user.id }, data: { totpSecret: null, totpEnabled: false } });
  revalidatePath("/settings/security");
  redirect("/settings/security");
}

// Step 2: confirm a code against the pending secret and turn 2FA on.
export async function enableTotpAction(_prev: TotpState, formData: FormData): Promise<TotpState> {
  const user = await requireUser();
  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { totpSecret: true, totpEnabled: true } });
  if (!record?.totpSecret || record.totpEnabled) return { error: "No pending setup. Start again." };
  const secret = decryptSecret(record.totpSecret);
  if (!secret) return { error: "Could not read the secret. Start setup again." };
  const code = formData.get("code");
  if (typeof code !== "string" || !verifyTotp(secret, code)) {
    return { error: "That code is not valid. Try again." };
  }
  await prisma.user.update({ where: { id: user.id }, data: { totpEnabled: true } });
  revalidatePath("/settings/security");
  redirect("/settings/security");
}

export async function disableTotpAction(_prev: TotpState, formData: FormData): Promise<TotpState> {
  const user = await requireUser();
  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { totpSecret: true, totpEnabled: true } });
  if (!record?.totpEnabled || !record.totpSecret) {
    await prisma.user.update({ where: { id: user.id }, data: { totpSecret: null, totpEnabled: false } });
    redirect("/settings/security");
  }
  const secret = decryptSecret(record!.totpSecret!);
  const code = formData.get("code");
  if (!secret || typeof code !== "string" || !verifyTotp(secret, code)) {
    return { error: "Enter a current code to turn off two-factor authentication." };
  }
  await prisma.user.update({ where: { id: user.id }, data: { totpSecret: null, totpEnabled: false } });
  revalidatePath("/settings/security");
  redirect("/settings/security");
}
