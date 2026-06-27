"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { clientSchema, normalizeClientInput } from "@/lib/validation/client";
import { parseClientsCsv } from "@/lib/clients/import";
import { recordAudit } from "@/lib/audit/log";

export interface ClientFormState {
  error?: string;
}

export interface ClientImportState {
  error?: string;
  imported?: number;
  errors?: { line: number; message: string }[];
}

export async function importClientsAction(
  _prev: ClientImportState,
  formData: FormData,
): Promise<ClientImportState> {
  await requirePermission("clients.manage");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a CSV file to import." };
  }
  const text = await file.text();
  const { valid, errors } = parseClientsCsv(text);
  if (valid.length === 0) {
    return { error: "No valid rows to import.", errors };
  }
  await prisma.client.createMany({
    data: valid.map((c) => ({ companyName: c.companyName, domain: c.domain, status: c.status })),
  });
  revalidatePath("/clients");
  return { imported: valid.length, errors };
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
  await recordAudit({ action: "created", entityType: "client", entityId: created.id, entityLabel: created.companyName, summary: `Created client "${created.companyName}"` });
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
  await recordAudit({ action: "updated", entityType: "client", entityId: id, entityLabel: parsed.data.companyName, summary: `Updated client "${parsed.data.companyName}"` });
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}

export async function deleteClientAction(formData: FormData): Promise<void> {
  await requirePermission("clients.manage");
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    const existing = await prisma.client.findUnique({ where: { id }, select: { companyName: true } });
    await prisma.client.delete({ where: { id } });
    await recordAudit({ action: "deleted", entityType: "client", entityId: id, entityLabel: existing?.companyName, summary: `Deleted client "${existing?.companyName ?? id}"` });
  }
  revalidatePath("/clients");
  redirect("/clients");
}
