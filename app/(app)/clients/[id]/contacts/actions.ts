"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { contactSchema, normalizeContactInput } from "@/lib/validation/contact";
import { generatePortalToken } from "@/lib/portal/token";
import { getAppSettings } from "@/lib/settings/service";
import { isSmtpConfigured, sendMail } from "@/lib/mailer";

export interface ContactFormState {
  error?: string;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Enable portal access for a contact and email them a link to set their password.
export async function grantPortalAccessAction(formData: FormData): Promise<void> {
  await requirePermission("clients.manage");
  const id = formData.get("id");
  const clientId = formData.get("clientId");
  if (typeof id === "string" && id.length > 0) {
    const contact = await prisma.clientContact.findUnique({ where: { id } });
    if (contact && contact.email) {
      await prisma.clientContact.update({ where: { id }, data: { portalEnabled: true } });
      const { token, tokenHash } = generatePortalToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      await prisma.portalToken.create({ data: { contactId: id, tokenHash, expiresAt } });
      const base = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
      const link = `${base}/portal/set-password/${token}`;
      try {
        if (await isSmtpConfigured()) {
          const settings = await getAppSettings();
          await sendMail({
            to: contact.email,
            subject: `Access the ${settings.companyName} client portal`,
            html: `<p>You have been granted access to the <strong>${escapeHtml(settings.companyName)}</strong> client portal.</p><p><a href="${link}">Set your password</a> (link expires in 24 hours).</p>`,
            text: `Set your client portal password: ${link} (expires in 24 hours).`,
          });
        } else {
          console.log(`[portal-invite] ${contact.email}: ${link}`);
        }
      } catch (e) {
        console.error("portal invite email failed", e);
      }
    }
  }
  if (typeof clientId === "string") revalidatePath(`/clients/${clientId}`);
  redirect(typeof clientId === "string" ? `/clients/${clientId}` : "/clients");
}

export async function revokePortalAccessAction(formData: FormData): Promise<void> {
  await requirePermission("clients.manage");
  const id = formData.get("id");
  const clientId = formData.get("clientId");
  if (typeof id === "string" && id.length > 0) {
    await prisma.clientContact.update({
      where: { id },
      data: { portalEnabled: false, passwordHash: null },
    });
    await prisma.portalToken.updateMany({
      where: { contactId: id, usedAt: null },
      data: { usedAt: new Date() },
    });
  }
  if (typeof clientId === "string") revalidatePath(`/clients/${clientId}`);
  redirect(typeof clientId === "string" ? `/clients/${clientId}` : "/clients");
}

const ALLOWED_PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_PHOTO_BYTES = 1024 * 1024; // 1 MB

function parse(formData: FormData) {
  return contactSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    jobTitle: formData.get("jobTitle"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    isVip: formData.get("isVip") ?? undefined,
  });
}

async function readPhoto(
  formData: FormData,
): Promise<{ ok: true; data?: Uint8Array<ArrayBuffer>; mime?: string } | { ok: false; error: string }> {
  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) return { ok: true };
  if (!ALLOWED_PHOTO_TYPES.includes(photo.type)) {
    return { ok: false, error: "Photo must be a PNG, JPEG, or WebP image." };
  }
  if (photo.size > MAX_PHOTO_BYTES) {
    return { ok: false, error: "Photo must be 1 MB or smaller." };
  }
  return { ok: true, data: new Uint8Array(await photo.arrayBuffer() as ArrayBuffer), mime: photo.type };
}

export async function createContactAction(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  await requirePermission("clients.manage");
  const clientId = formData.get("clientId");
  if (typeof clientId !== "string" || clientId.length === 0) return { error: "Missing client." };
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const photo = await readPhoto(formData);
  if (!photo.ok) return { error: photo.error };

  await prisma.clientContact.create({
    data: {
      clientId,
      ...normalizeContactInput(parsed.data),
      ...(photo.data ? { photoData: photo.data, photoMimeType: photo.mime } : {}),
    },
  });
  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}`);
}

export async function updateContactAction(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  await requirePermission("clients.manage");
  const id = formData.get("id");
  const clientId = formData.get("clientId");
  if (typeof id !== "string" || id.length === 0 || typeof clientId !== "string") {
    return { error: "Missing contact." };
  }
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const photo = await readPhoto(formData);
  if (!photo.ok) return { error: photo.error };

  await prisma.clientContact.update({
    where: { id },
    data: {
      ...normalizeContactInput(parsed.data),
      ...(photo.data ? { photoData: photo.data, photoMimeType: photo.mime } : {}),
    },
  });
  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}`);
}

export async function deleteContactAction(formData: FormData): Promise<void> {
  await requirePermission("clients.manage");
  const id = formData.get("id");
  const clientId = formData.get("clientId");
  if (typeof id === "string" && id.length > 0) {
    await prisma.clientContact.delete({ where: { id } });
  }
  if (typeof clientId === "string") revalidatePath(`/clients/${clientId}`);
  redirect(typeof clientId === "string" ? `/clients/${clientId}` : "/clients");
}
