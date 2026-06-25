"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { clientSchema, normalizeClientInput } from "@/lib/validation/client";

export interface ClientFormState {
  error?: string;
}

function parseForm(formData: FormData) {
  return clientSchema.safeParse({
    companyName: formData.get("companyName"),
    domain: formData.get("domain"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    address: formData.get("address"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country"),
    status: formData.get("status"),
    assignedTechnicianId: formData.get("assignedTechnicianId"),
    notes: formData.get("notes"),
    industryId: formData.get("industryId"),
  });
}

export async function createClientAction(
  _prevState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  await requirePermission("clients.manage");
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const created = await prisma.client.create({
    data: normalizeClientInput(parsed.data),
  });
  revalidatePath("/clients");
  redirect(`/clients/${created.id}`);
}

export async function updateClientAction(
  _prevState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  await requirePermission("clients.manage");
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return { error: "Missing client id." };
  }
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  await prisma.client.update({
    where: { id },
    data: normalizeClientInput(parsed.data),
  });
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}

export async function deleteClientAction(formData: FormData): Promise<void> {
  await requirePermission("clients.manage");
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    await prisma.client.delete({ where: { id } });
  }
  revalidatePath("/clients");
  redirect("/clients");
}
