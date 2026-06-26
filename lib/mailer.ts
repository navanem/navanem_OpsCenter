import nodemailer from "nodemailer";
import { getAppSettings } from "@/lib/settings/service";
import { decryptSecret } from "@/lib/crypto/secret";

export async function isSmtpConfigured(): Promise<boolean> {
  const s = await getAppSettings();
  return Boolean(s.smtpHost && s.smtpPort && s.smtpFrom);
}

export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: MailAttachment[];
}

export async function sendMail(msg: MailMessage): Promise<void> {
  const s = await getAppSettings();
  if (!s.smtpHost || !s.smtpPort || !s.smtpFrom) {
    throw new Error("SMTP is not configured.");
  }
  const pass = s.smtpPasswordEnc ? decryptSecret(s.smtpPasswordEnc) ?? undefined : undefined;
  const transport = nodemailer.createTransport({
    host: s.smtpHost,
    port: s.smtpPort,
    secure: s.smtpSecure,
    auth: s.smtpUser ? { user: s.smtpUser, pass } : undefined,
  });
  await transport.sendMail({
    from: s.smtpFrom,
    to: msg.to,
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
    attachments: msg.attachments,
  });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function invitationEmail(opts: { link: string; companyName: string }): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `You have been invited to ${opts.companyName}`;
  const text = `You have been invited to ${opts.companyName}. Set up your account: ${opts.link}`;
  const safeName = escapeHtml(opts.companyName);
  const html = `<p>You have been invited to <strong>${safeName}</strong>.</p><p><a href="${opts.link}">Set up your account</a></p>`;
  return { subject, html, text };
}

export function passwordResetEmail(opts: { link: string; companyName: string }): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Reset your ${opts.companyName} password`;
  const text = `Reset your password: ${opts.link}\nThis link expires in 1 hour. If you did not request this, ignore this email.`;
  const safeName = escapeHtml(opts.companyName);
  const html = `<p>A password reset was requested for your <strong>${safeName}</strong> account.</p><p><a href="${opts.link}">Reset your password</a></p><p>This link expires in 1 hour. If you did not request this, you can safely ignore this email.</p>`;
  return { subject, html, text };
}
