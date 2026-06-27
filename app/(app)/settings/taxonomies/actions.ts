"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { taxonomyWithColorSchema, industrySchema } from "@/lib/validation/taxonomy";

export interface TaxonomyState {
  error?: string;
  ok?: boolean;
}

type Kind = "category" | "priority" | "industry" | "project-status" | "task-status" | "visit-type" | "contract-status" | "tag" | "knowledge-category" | "device-type" | "device-status" | "subscription-type" | "subscription-status" | "ticket-type" | "change-type" | "change-status" | "ci-type" | "ci-status" | "lead-source" | "lead-status" | "opportunity-stage" | "problem-type" | "problem-status" | "release-type" | "release-status";

function isKind(v: FormDataEntryValue | null): v is Kind {
  return (
    v === "category" ||
    v === "priority" ||
    v === "industry" ||
    v === "project-status" ||
    v === "task-status" ||
    v === "visit-type" ||
    v === "contract-status" ||
    v === "tag" ||
    v === "knowledge-category" ||
    v === "device-type" ||
    v === "device-status" ||
    v === "subscription-type" ||
    v === "subscription-status" ||
    v === "ticket-type" ||
    v === "change-type" ||
    v === "change-status" ||
    v === "ci-type" ||
    v === "ci-status" ||
    v === "lead-source" ||
    v === "lead-status" ||
    v === "opportunity-stage" ||
    v === "problem-type" ||
    v === "problem-status" ||
    v === "release-type" ||
    v === "release-status"
  );
}

export async function saveTaxonomyAction(
  _prev: TaxonomyState,
  formData: FormData,
): Promise<TaxonomyState> {
  await requirePermission("settings.manage");

  const kind = formData.get("kind");
  if (!isKind(kind)) return { error: "Invalid type." };

  const id = formData.get("id");
  const editing = typeof id === "string" && id.length > 0;

  if (kind === "industry") {
    const parsed = industrySchema.safeParse({
      name: formData.get("name"),
      sortOrder: formData.get("sortOrder"),
      isActive: formData.get("isActive"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
    const data = {
      name: parsed.data.name,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    };
    if (editing) await prisma.clientIndustry.update({ where: { id: id as string }, data });
    else await prisma.clientIndustry.create({ data });
  } else {
    const parsed = taxonomyWithColorSchema.safeParse({
      name: formData.get("name"),
      color: formData.get("color"),
      sortOrder: formData.get("sortOrder"),
      isActive: formData.get("isActive"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
    const data = {
      name: parsed.data.name,
      color: parsed.data.color,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    };
    if (kind === "category") {
      if (editing) await prisma.ticketCategory.update({ where: { id: id as string }, data });
      else await prisma.ticketCategory.create({ data });
    } else if (kind === "priority") {
      if (editing) await prisma.ticketPriority.update({ where: { id: id as string }, data });
      else await prisma.ticketPriority.create({ data });
    } else if (kind === "project-status") {
      if (editing) await prisma.projectStatus.update({ where: { id: id as string }, data });
      else await prisma.projectStatus.create({ data });
    } else if (kind === "visit-type") {
      if (editing) await prisma.visitType.update({ where: { id: id as string }, data });
      else await prisma.visitType.create({ data });
    } else if (kind === "contract-status") {
      if (editing) await prisma.contractStatus.update({ where: { id: id as string }, data });
      else await prisma.contractStatus.create({ data });
    } else if (kind === "tag") {
      if (editing) await prisma.ticketTag.update({ where: { id: id as string }, data });
      else await prisma.ticketTag.create({ data });
    } else if (kind === "knowledge-category") {
      if (editing) await prisma.knowledgeCategory.update({ where: { id: id as string }, data });
      else await prisma.knowledgeCategory.create({ data });
    } else if (kind === "device-type") {
      if (editing) await prisma.deviceType.update({ where: { id: id as string }, data });
      else await prisma.deviceType.create({ data });
    } else if (kind === "device-status") {
      if (editing) await prisma.deviceStatus.update({ where: { id: id as string }, data });
      else await prisma.deviceStatus.create({ data });
    } else if (kind === "subscription-type") {
      if (editing) await prisma.subscriptionType.update({ where: { id: id as string }, data });
      else await prisma.subscriptionType.create({ data });
    } else if (kind === "subscription-status") {
      if (editing) await prisma.subscriptionStatus.update({ where: { id: id as string }, data });
      else await prisma.subscriptionStatus.create({ data });
    } else if (kind === "ticket-type") {
      if (editing) await prisma.ticketType.update({ where: { id: id as string }, data });
      else await prisma.ticketType.create({ data });
    } else if (kind === "change-type") {
      if (editing) await prisma.changeType.update({ where: { id: id as string }, data });
      else await prisma.changeType.create({ data });
    } else if (kind === "change-status") {
      if (editing) await prisma.changeStatus.update({ where: { id: id as string }, data });
      else await prisma.changeStatus.create({ data });
    } else if (kind === "ci-type") {
      if (editing) await prisma.configItemType.update({ where: { id: id as string }, data });
      else await prisma.configItemType.create({ data });
    } else if (kind === "ci-status") {
      if (editing) await prisma.configItemStatus.update({ where: { id: id as string }, data });
      else await prisma.configItemStatus.create({ data });
    } else if (kind === "lead-source") {
      if (editing) await prisma.leadSource.update({ where: { id: id as string }, data });
      else await prisma.leadSource.create({ data });
    } else if (kind === "lead-status") {
      if (editing) await prisma.leadStatus.update({ where: { id: id as string }, data });
      else await prisma.leadStatus.create({ data });
    } else if (kind === "opportunity-stage") {
      if (editing) await prisma.opportunityStage.update({ where: { id: id as string }, data });
      else await prisma.opportunityStage.create({ data });
    } else if (kind === "problem-type") {
      if (editing) await prisma.problemType.update({ where: { id: id as string }, data });
      else await prisma.problemType.create({ data });
    } else if (kind === "problem-status") {
      if (editing) await prisma.problemStatus.update({ where: { id: id as string }, data });
      else await prisma.problemStatus.create({ data });
    } else if (kind === "release-type") {
      if (editing) await prisma.releaseType.update({ where: { id: id as string }, data });
      else await prisma.releaseType.create({ data });
    } else if (kind === "release-status") {
      if (editing) await prisma.releaseStatus.update({ where: { id: id as string }, data });
      else await prisma.releaseStatus.create({ data });
    } else {
      if (editing) await prisma.projectTaskStatus.update({ where: { id: id as string }, data });
      else await prisma.projectTaskStatus.create({ data });
    }
  }

  revalidatePath("/settings/taxonomies");
  return { ok: true };
}

export async function deleteTaxonomyAction(formData: FormData): Promise<void> {
  await requirePermission("settings.manage");

  const kind = formData.get("kind");
  const id = formData.get("id");

  if (isKind(kind) && typeof id === "string" && id.length > 0) {
    try {
      if (kind === "category") await prisma.ticketCategory.delete({ where: { id } });
      else if (kind === "priority") await prisma.ticketPriority.delete({ where: { id } });
      else if (kind === "project-status") await prisma.projectStatus.delete({ where: { id } });
      else if (kind === "task-status") await prisma.projectTaskStatus.delete({ where: { id } });
      else if (kind === "visit-type") await prisma.visitType.delete({ where: { id } });
      else if (kind === "contract-status") await prisma.contractStatus.delete({ where: { id } });
      else if (kind === "tag") await prisma.ticketTag.delete({ where: { id } });
      else if (kind === "knowledge-category") await prisma.knowledgeCategory.delete({ where: { id } });
      else if (kind === "device-type") await prisma.deviceType.delete({ where: { id } });
      else if (kind === "device-status") await prisma.deviceStatus.delete({ where: { id } });
      else if (kind === "subscription-type") await prisma.subscriptionType.delete({ where: { id } });
      else if (kind === "subscription-status") await prisma.subscriptionStatus.delete({ where: { id } });
      else if (kind === "ticket-type") await prisma.ticketType.delete({ where: { id } });
      else if (kind === "change-type") await prisma.changeType.delete({ where: { id } });
      else if (kind === "change-status") await prisma.changeStatus.delete({ where: { id } });
      else if (kind === "ci-type") await prisma.configItemType.delete({ where: { id } });
      else if (kind === "ci-status") await prisma.configItemStatus.delete({ where: { id } });
      else if (kind === "lead-source") await prisma.leadSource.delete({ where: { id } });
      else if (kind === "lead-status") await prisma.leadStatus.delete({ where: { id } });
      else if (kind === "opportunity-stage") await prisma.opportunityStage.delete({ where: { id } });
      else if (kind === "problem-type") await prisma.problemType.delete({ where: { id } });
      else if (kind === "problem-status") await prisma.problemStatus.delete({ where: { id } });
      else if (kind === "release-type") await prisma.releaseType.delete({ where: { id } });
      else if (kind === "release-status") await prisma.releaseStatus.delete({ where: { id } });
      else await prisma.clientIndustry.delete({ where: { id } });
    } catch {
      // A taxonomy item still referenced by tickets/projects cannot be deleted (FK RESTRICT).
      // The UI advises deactivating instead. Swallow to avoid a crash.
    }
  }

  revalidatePath("/settings/taxonomies");
}
