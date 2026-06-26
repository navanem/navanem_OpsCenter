"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateResetToken } from "@/lib/auth/reset-token";
import { getAppSettings } from "@/lib/settings/service";
import { isSmtpConfigured, sendMail, passwordResetEmail } from "@/lib/mailer";

export interface ForgotState {
  ok?: boolean;
  error?: string;
}

const emailSchema = z.object({ email: z.string().trim().email() });

export async function requestPasswordResetAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "Enter a valid email address." };
  const email = parsed.data.email;

  const user = await prisma.user.findUnique({ where: { email } });
  // Always respond identically so the form never reveals which emails exist.
  if (user && user.status === "ACTIVE") {
    const { token, tokenHash } = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } });

    const base = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
    const link = `${base}/reset-password/${token}`;
    try {
      if (await isSmtpConfigured()) {
        const settings = await getAppSettings();
        const mail = passwordResetEmail({ link, companyName: settings.companyName });
        await sendMail({ to: email, ...mail });
      } else {
        // Dev fallback when no SMTP is configured: surface the link in the server log.
        console.log(`[password-reset] ${email}: ${link}`);
      }
    } catch (e) {
      console.error("password reset email failed", e);
    }
  }

  return { ok: true };
}
