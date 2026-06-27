"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { isChangesEnabled } from "@/lib/settings/service";
import { changeSchema, normalizeChangeInput } from "@/lib/validation/change";
import { recordAudit } from "@/lib/audit/log";
import { formatChangeReference } from "@/lib/changes/meta";

export interface ChangeFormState {
  error?: string;
}

async function requireChanges() {
  const user = await requirePermission("changes.manage");
  if (!(await isChangesEnabled())) redirect("/dashboard");
  return user;
}

function parseForm(formData: FormData) {
  return changeSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    typeId: formData.get("typeId"),
    statusId: formData.get("statusId"),
    clientId: formData.get("clientId"),
    assigneeId: formData.get("assigneeId"),
    risk: formData.get("risk"),
    impact: formData.get("impact"),
    plannedStart: formData.get("plannedStart"),
    plannedEnd: formData.get("plannedEnd"),
    implementationPlan: formData.get("implementationPlan"),
    rollbackPlan: formData.get("rollbackPlan"),
  });
}

export async function createChangeAction(_prev: ChangeFormState, formData: FormData): Promise<ChangeFormState> {
  await requireChanges();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const change = await prisma.change.create({ data: normalizeChangeInput(parsed.data) });
  await recordAudit({ action: "created", entityType: "change", entityId: change.id, entityLabel: formatChangeReference(change.number), summary: `Created change "${change.title}"` });
  revalidatePath("/changes");
  redirect(`/changes/${change.id}/edit`);
}

export async function updateChangeAction(_prev: ChangeFormState, formData: FormData): Promise<ChangeFormState> {
  await requireChanges();
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return { error: "Missing change id." };
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await prisma.change.update({ where: { id }, data: normalizeChangeInput(parsed.data) });
  await recordAudit({ action: "updated", entityType: "change", entityId: id, entityLabel: parsed.data.title, summary: `Updated change "${parsed.data.title}"` });
  revalidatePath("/changes");
  redirect("/changes");
}

export async function deleteChangeAction(formData: FormData): Promise<void> {
  await requireChanges();
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    const existing = await prisma.change.findUnique({ where: { id }, select: { number: true } });
    await prisma.change.delete({ where: { id } });
    await recordAudit({ action: "deleted", entityType: "change", entityId: id, entityLabel: existing ? formatChangeReference(existing.number) : undefined, summary: `Deleted change ${existing ? formatChangeReference(existing.number) : id}` });
    revalidatePath("/changes");
  }
  redirect("/changes");
}

// Approve or reject a change: sets the matching status + the approver/approvedAt fields.
export async function decideChangeAction(formData: FormData): Promise<void> {
  const user = await requirePermission("changes.approve");
  const id = formData.get("id");
  const decision = formData.get("decision"); // "approve" | "reject"
  if (typeof id === "string" && id.length > 0 && (decision === "approve" || decision === "reject")) {
    const targetName = decision === "approve" ? "Approved" : "Rejected";
    const status = await prisma.changeStatus.findFirst({ where: { name: targetName } });
    const change = await prisma.change.findUnique({ where: { id }, select: { number: true } });
    await prisma.change.update({
      where: { id },
      data: {
        ...(status ? { statusId: status.id } : {}),
        approvedById: decision === "approve" ? user.id : null,
        approvedAt: decision === "approve" ? new Date() : null,
      },
    });
    await recordAudit({ action: "status_changed", entityType: "change", entityId: id, entityLabel: change ? formatChangeReference(change.number) : undefined, summary: `${decision === "approve" ? "Approved" : "Rejected"} change ${change ? formatChangeReference(change.number) : id}` });
    revalidatePath(`/changes/${id}/edit`);
    revalidatePath("/changes");
  }
  redirect(`/changes/${typeof id === "string" ? id : ""}/edit`);
}
