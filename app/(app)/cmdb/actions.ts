"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { isCmdbEnabled } from "@/lib/settings/service";
import { configItemSchema, normalizeConfigItemInput, parseRelatedIds } from "@/lib/validation/configitem";
import { recordAudit } from "@/lib/audit/log";
import { formatCiReference } from "@/lib/cmdb/meta";

export interface ConfigItemFormState {
  error?: string;
}

async function requireCmdb() {
  const user = await requirePermission("cmdb.manage");
  if (!(await isCmdbEnabled())) redirect("/dashboard");
  return user;
}

function parseForm(formData: FormData) {
  return configItemSchema.safeParse({
    name: formData.get("name"),
    typeId: formData.get("typeId"),
    statusId: formData.get("statusId"),
    clientId: formData.get("clientId"),
    deviceId: formData.get("deviceId"),
    environment: formData.get("environment"),
    location: formData.get("location"),
    owner: formData.get("owner"),
    description: formData.get("description"),
  });
}

export async function createConfigItemAction(_prev: ConfigItemFormState, formData: FormData): Promise<ConfigItemFormState> {
  await requireCmdb();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const relatedIds = parseRelatedIds(formData.getAll("relatedTo"));
  const ci = await prisma.configItem.create({
    data: {
      ...normalizeConfigItemInput(parsed.data),
      ...(relatedIds.length ? { relatedTo: { connect: relatedIds.map((id) => ({ id })) } } : {}),
    },
  });
  await recordAudit({ action: "created", entityType: "config_item", entityId: ci.id, entityLabel: formatCiReference(ci.number), summary: `Created CI "${ci.name}"` });
  revalidatePath("/cmdb");
  redirect(`/cmdb/${ci.id}/edit`);
}

export async function updateConfigItemAction(_prev: ConfigItemFormState, formData: FormData): Promise<ConfigItemFormState> {
  await requireCmdb();
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return { error: "Missing config item id." };
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const relatedIds = parseRelatedIds(formData.getAll("relatedTo"));
  await prisma.configItem.update({
    where: { id },
    data: {
      ...normalizeConfigItemInput(parsed.data),
      relatedTo: { set: relatedIds.map((rid) => ({ id: rid })) },
    },
  });
  await recordAudit({ action: "updated", entityType: "config_item", entityId: id, entityLabel: parsed.data.name, summary: `Updated CI "${parsed.data.name}"` });
  revalidatePath("/cmdb");
  redirect("/cmdb");
}

export async function deleteConfigItemAction(formData: FormData): Promise<void> {
  await requireCmdb();
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    const existing = await prisma.configItem.findUnique({ where: { id }, select: { number: true } });
    await prisma.configItem.delete({ where: { id } });
    await recordAudit({ action: "deleted", entityType: "config_item", entityId: id, entityLabel: existing ? formatCiReference(existing.number) : undefined, summary: `Deleted CI ${existing ? formatCiReference(existing.number) : id}` });
    revalidatePath("/cmdb");
  }
  redirect("/cmdb");
}
