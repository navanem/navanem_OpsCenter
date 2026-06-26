"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser, requirePermission } from "@/lib/auth/guard";
import { APP_SETTING_ID } from "@/lib/settings/service";
import { encryptSecret, decryptSecret } from "@/lib/crypto/secret";
import { newTotpSecret, verifyTotp } from "@/lib/auth/totp";
import { generateBackupCodes } from "@/lib/auth/backup-codes";

export interface TotpState {
  error?: string;
  codes?: string[];
}

// Admin: require 2FA for all accounts.
export async function updateEnforce2faAction(formData: FormData): Promise<void> {
  await requirePermission("settings.manage");
  const enabled = formData.get("enforce2fa") === "true";
  await prisma.appSetting.upsert({
    where: { id: APP_SETTING_ID },
    update: { enforce2fa: enabled },
    create: { id: APP_SETTING_ID, enforce2fa: enabled },
  });
  revalidatePath("/", "layout");
  redirect("/settings/security");
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
  await prisma.user.update({ where: { id: user.id }, data: { totpSecret: null, totpEnabled: false, totpBackupCodes: [] } });
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
  const { codes, hashes } = generateBackupCodes();
  await prisma.user.update({ where: { id: user.id }, data: { totpEnabled: true, totpBackupCodes: hashes } });
  revalidatePath("/settings/security");
  return { codes };
}

export async function regenerateBackupCodesAction(_prev: TotpState, formData: FormData): Promise<TotpState> {
  const user = await requireUser();
  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { totpSecret: true, totpEnabled: true } });
  if (!record?.totpEnabled || !record.totpSecret) return { error: "Two-factor authentication is not enabled." };
  const secret = decryptSecret(record.totpSecret);
  const code = formData.get("code");
  if (!secret || typeof code !== "string" || !verifyTotp(secret, code)) {
    return { error: "Enter a current code to regenerate backup codes." };
  }
  const { codes, hashes } = generateBackupCodes();
  await prisma.user.update({ where: { id: user.id }, data: { totpBackupCodes: hashes } });
  return { codes };
}

export async function disableTotpAction(_prev: TotpState, formData: FormData): Promise<TotpState> {
  const user = await requireUser();
  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { totpSecret: true, totpEnabled: true } });
  if (!record?.totpEnabled || !record.totpSecret) {
    await prisma.user.update({ where: { id: user.id }, data: { totpSecret: null, totpEnabled: false, totpBackupCodes: [] } });
    redirect("/settings/security");
  }
  const secret = decryptSecret(record!.totpSecret!);
  const code = formData.get("code");
  if (!secret || typeof code !== "string" || !verifyTotp(secret, code)) {
    return { error: "Enter a current code to turn off two-factor authentication." };
  }
  await prisma.user.update({ where: { id: user.id }, data: { totpSecret: null, totpEnabled: false, totpBackupCodes: [] } });
  revalidatePath("/settings/security");
  redirect("/settings/security");
}
