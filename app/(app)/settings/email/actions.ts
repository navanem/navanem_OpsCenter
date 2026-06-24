"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { smtpSettingsSchema } from "@/lib/validation/settings";
import { encryptSecret } from "@/lib/crypto/secret";
import { APP_SETTING_ID, getAppSettings } from "@/lib/settings/service";
import { sendMail } from "@/lib/mailer";

export interface SmtpState {
  error?: string;
  ok?: boolean;
}

export interface TestState {
  error?: string;
  ok?: boolean;
}

function blankToNull(v: FormDataEntryValue | null): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length > 0 ? s : null;
}

export async function updateSmtpAction(
  _prev: SmtpState,
  formData: FormData,
): Promise<SmtpState> {
  await requirePermission("settings.manage");
  const parsed = smtpSettingsSchema.safeParse({
    smtpHost: formData.get("smtpHost"),
    smtpPort: formData.get("smtpPort"),
    smtpUser: formData.get("smtpUser"),
    smtpPassword: formData.get("smtpPassword"),
    smtpFrom: formData.get("smtpFrom"),
    smtpSecure: formData.get("smtpSecure") === "on" ? "true" : "false",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const portStr = blankToNull(formData.get("smtpPort"));
  const password = typeof formData.get("smtpPassword") === "string"
    ? (formData.get("smtpPassword") as string)
    : "";

  const update: Record<string, unknown> = {
    smtpHost: blankToNull(formData.get("smtpHost")),
    smtpPort: portStr ? Number(portStr) : null,
    smtpUser: blankToNull(formData.get("smtpUser")),
    smtpFrom: blankToNull(formData.get("smtpFrom")),
    smtpSecure: formData.get("smtpSecure") === "on",
  };
  // Only overwrite the stored password when a new one is provided.
  if (password.length > 0) {
    update.smtpPasswordEnc = encryptSecret(password);
  }

  await prisma.appSetting.upsert({
    where: { id: APP_SETTING_ID },
    update,
    create: { id: APP_SETTING_ID, ...update },
  });
  revalidatePath("/settings/email");
  return { ok: true };
}

export async function sendTestEmailAction(
  _prev: TestState,
  formData: FormData,
): Promise<TestState> {
  const user = await requirePermission("settings.manage");
  const settings = await getAppSettings();
  if (!settings.smtpHost || !settings.smtpPort || !settings.smtpFrom) {
    return { error: "Save the SMTP settings first." };
  }
  try {
    await sendMail({
      to: user.email,
      subject: "OpsCenter test email",
      html: "<p>This is a test email from OpsCenter. Your SMTP settings work.</p>",
      text: "This is a test email from OpsCenter. Your SMTP settings work.",
    });
    return { ok: true };
  } catch {
    return { error: "Could not send the test email. Check your SMTP settings." };
  }
}
