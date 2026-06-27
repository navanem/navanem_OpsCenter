"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { isCrmEnabled } from "@/lib/settings/service";
import { leadSchema, normalizeLeadInput } from "@/lib/validation/crm";
import { recordAudit } from "@/lib/audit/log";
import { formatLeadReference } from "@/lib/crm/meta";

export interface LeadFormState {
  error?: string;
}

async function requireCrm() {
  const user = await requirePermission("crm.manage");
  if (!(await isCrmEnabled())) redirect("/dashboard");
  return user;
}

function parseForm(formData: FormData) {
  return leadSchema.safeParse({
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    sourceId: formData.get("sourceId"),
    statusId: formData.get("statusId"),
    ownerId: formData.get("ownerId"),
    estimatedValue: formData.get("estimatedValue"),
    notes: formData.get("notes"),
  });
}

export async function createLeadAction(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  await requireCrm();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const lead = await prisma.lead.create({ data: normalizeLeadInput(parsed.data) });
  await recordAudit({ action: "created", entityType: "lead", entityId: lead.id, entityLabel: formatLeadReference(lead.number), summary: `Created lead "${lead.companyName}"` });
  revalidatePath("/crm/leads");
  redirect(`/crm/leads/${lead.id}/edit`);
}

export async function updateLeadAction(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  await requireCrm();
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return { error: "Missing lead id." };
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await prisma.lead.update({ where: { id }, data: normalizeLeadInput(parsed.data) });
  await recordAudit({ action: "updated", entityType: "lead", entityId: id, entityLabel: parsed.data.companyName, summary: `Updated lead "${parsed.data.companyName}"` });
  revalidatePath("/crm/leads");
  redirect("/crm/leads");
}

export async function deleteLeadAction(formData: FormData): Promise<void> {
  await requireCrm();
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    const existing = await prisma.lead.findUnique({ where: { id }, select: { number: true } });
    await prisma.lead.delete({ where: { id } });
    await recordAudit({ action: "deleted", entityType: "lead", entityId: id, entityLabel: existing ? formatLeadReference(existing.number) : undefined, summary: `Deleted lead ${existing ? formatLeadReference(existing.number) : id}` });
    revalidatePath("/crm/leads");
  }
  redirect("/crm/leads");
}

// Convert a lead into a client, carrying over company/contact details.
export async function convertLeadAction(formData: FormData): Promise<void> {
  await requireCrm();
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (lead && !lead.convertedClientId) {
      const client = await prisma.client.create({
        data: {
          companyName: lead.companyName,
          contactName: lead.contactName,
          contactEmail: lead.email,
          contactPhone: lead.phone,
          notes: lead.notes,
        },
      });
      await prisma.lead.update({ where: { id }, data: { convertedClientId: client.id, convertedAt: new Date() } });
      await recordAudit({ action: "converted", entityType: "lead", entityId: id, entityLabel: formatLeadReference(lead.number), summary: `Converted lead "${lead.companyName}" to client` });
      revalidatePath("/crm/leads");
      revalidatePath("/clients");
    }
  }
  redirect(`/crm/leads/${typeof id === "string" ? id : ""}/edit`);
}
