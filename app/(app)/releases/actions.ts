"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { isReleasesEnabled } from "@/lib/settings/service";
import { releaseSchema, normalizeReleaseInput } from "@/lib/validation/release";
import { recordAudit } from "@/lib/audit/log";
import { formatReleaseReference } from "@/lib/releases/meta";

export interface ReleaseFormState {
  error?: string;
}

async function requireReleases() {
  const user = await requirePermission("releases.manage");
  if (!(await isReleasesEnabled())) redirect("/dashboard");
  return user;
}

function parseForm(formData: FormData) {
  return releaseSchema.safeParse({
    name: formData.get("name"),
    version: formData.get("version"),
    description: formData.get("description"),
    typeId: formData.get("typeId"),
    statusId: formData.get("statusId"),
    clientId: formData.get("clientId"),
    ownerId: formData.get("ownerId"),
    plannedDate: formData.get("plannedDate"),
    releasedDate: formData.get("releasedDate"),
    releaseNotes: formData.get("releaseNotes"),
    rollbackPlan: formData.get("rollbackPlan"),
  });
}

export async function createReleaseAction(_prev: ReleaseFormState, formData: FormData): Promise<ReleaseFormState> {
  await requireReleases();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const release = await prisma.release.create({ data: normalizeReleaseInput(parsed.data) });
  await recordAudit({ action: "created", entityType: "release", entityId: release.id, entityLabel: formatReleaseReference(release.number), summary: `Created release "${release.name}"` });
  revalidatePath("/releases");
  redirect(`/releases/${release.id}/edit`);
}

export async function updateReleaseAction(_prev: ReleaseFormState, formData: FormData): Promise<ReleaseFormState> {
  await requireReleases();
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return { error: "Missing release id." };
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await prisma.release.update({ where: { id }, data: normalizeReleaseInput(parsed.data) });
  await recordAudit({ action: "updated", entityType: "release", entityId: id, entityLabel: parsed.data.name, summary: `Updated release "${parsed.data.name}"` });
  revalidatePath("/releases");
  redirect("/releases");
}

export async function deleteReleaseAction(formData: FormData): Promise<void> {
  await requireReleases();
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    const existing = await prisma.release.findUnique({ where: { id }, select: { number: true } });
    await prisma.release.delete({ where: { id } });
    await recordAudit({ action: "deleted", entityType: "release", entityId: id, entityLabel: existing ? formatReleaseReference(existing.number) : undefined, summary: `Deleted release ${existing ? formatReleaseReference(existing.number) : id}` });
    revalidatePath("/releases");
  }
  redirect("/releases");
}
