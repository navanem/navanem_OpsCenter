"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { isCrmEnabled } from "@/lib/settings/service";
import { opportunitySchema, normalizeOpportunityInput } from "@/lib/validation/crm";
import { recordAudit } from "@/lib/audit/log";
import { formatOpportunityReference } from "@/lib/crm/meta";

export interface OpportunityFormState {
  error?: string;
}

async function requireCrm() {
  const user = await requirePermission("crm.manage");
  if (!(await isCrmEnabled())) redirect("/dashboard");
  return user;
}

function parseForm(formData: FormData) {
  return opportunitySchema.safeParse({
    name: formData.get("name"),
    clientId: formData.get("clientId"),
    stageId: formData.get("stageId"),
    ownerId: formData.get("ownerId"),
    value: formData.get("value"),
    probability: formData.get("probability"),
    outcome: formData.get("outcome"),
    expectedCloseAt: formData.get("expectedCloseAt"),
    notes: formData.get("notes"),
  });
}

export async function createOpportunityAction(_prev: OpportunityFormState, formData: FormData): Promise<OpportunityFormState> {
  await requireCrm();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const opp = await prisma.opportunity.create({ data: normalizeOpportunityInput(parsed.data) });
  await recordAudit({ action: "created", entityType: "opportunity", entityId: opp.id, entityLabel: formatOpportunityReference(opp.number), summary: `Created opportunity "${opp.name}"` });
  revalidatePath("/crm");
  redirect(`/crm/${opp.id}/edit`);
}

export async function updateOpportunityAction(_prev: OpportunityFormState, formData: FormData): Promise<OpportunityFormState> {
  await requireCrm();
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return { error: "Missing opportunity id." };
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await prisma.opportunity.update({ where: { id }, data: normalizeOpportunityInput(parsed.data) });
  await recordAudit({ action: "updated", entityType: "opportunity", entityId: id, entityLabel: parsed.data.name, summary: `Updated opportunity "${parsed.data.name}"` });
  revalidatePath("/crm");
  redirect("/crm");
}

export async function deleteOpportunityAction(formData: FormData): Promise<void> {
  await requireCrm();
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    const existing = await prisma.opportunity.findUnique({ where: { id }, select: { number: true } });
    await prisma.opportunity.delete({ where: { id } });
    await recordAudit({ action: "deleted", entityType: "opportunity", entityId: id, entityLabel: existing ? formatOpportunityReference(existing.number) : undefined, summary: `Deleted opportunity ${existing ? formatOpportunityReference(existing.number) : id}` });
    revalidatePath("/crm");
  }
  redirect("/crm");
}
