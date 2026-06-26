"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { setPortalSessionCookie } from "@/lib/portal/session";

export interface PortalLoginState {
  error?: string;
}

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function portalLoginAction(
  _prev: PortalLoginState,
  formData: FormData,
): Promise<PortalLoginState> {
  const parsed = schema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Enter your email and password." };

  const contact = await prisma.clientContact.findFirst({
    where: { email: parsed.data.email, portalEnabled: true },
  });
  if (!contact || !contact.passwordHash) return { error: "Invalid email or password." };

  const ok = await verifyPassword(contact.passwordHash, parsed.data.password);
  if (!ok) return { error: "Invalid email or password." };

  await setPortalSessionCookie({ contactId: contact.id, clientId: contact.clientId });
  redirect("/portal");
}
