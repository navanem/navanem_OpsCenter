"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { isSubscriptionsEnabled } from "@/lib/settings/service";
import { subscriptionSchema, normalizeSubscriptionInput } from "@/lib/validation/subscription";
import { recordAudit } from "@/lib/audit/log";
import { formatSubscriptionReference } from "@/lib/subscriptions/meta";

export interface SubscriptionFormState {
  error?: string;
}

async function requireSubscriptions() {
  const user = await requirePermission("subscriptions.manage");
  if (!(await isSubscriptionsEnabled())) redirect("/dashboard");
  return user;
}

function parseForm(formData: FormData) {
  return subscriptionSchema.safeParse({
    name: formData.get("name"),
    typeId: formData.get("typeId"),
    statusId: formData.get("statusId"),
    clientId: formData.get("clientId"),
    provider: formData.get("provider"),
    reference: formData.get("reference"),
    cost: formData.get("cost"),
    billingCycle: formData.get("billingCycle"),
    seats: formData.get("seats"),
    startDate: formData.get("startDate"),
    renewalDate: formData.get("renewalDate"),
    autoRenew: formData.get("autoRenew") === "true",
    supportLevel: formData.get("supportLevel"),
    warrantyEnd: formData.get("warrantyEnd"),
    notes: formData.get("notes"),
  });
}

async function validateRefs(typeId: string, statusId: string): Promise<string | null> {
  const [type, status] = await Promise.all([
    prisma.subscriptionType.findUnique({ where: { id: typeId } }),
    prisma.subscriptionStatus.findUnique({ where: { id: statusId } }),
  ]);
  if (!type) return "Selected subscription type no longer exists.";
  if (!status) return "Selected status no longer exists.";
  return null;
}

export async function createSubscriptionAction(_prev: SubscriptionFormState, formData: FormData): Promise<SubscriptionFormState> {
  await requireSubscriptions();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const refError = await validateRefs(parsed.data.typeId, parsed.data.statusId);
  if (refError) return { error: refError };
  const sub = await prisma.subscription.create({ data: normalizeSubscriptionInput(parsed.data) });
  await recordAudit({ action: "created", entityType: "subscription", entityId: sub.id, entityLabel: formatSubscriptionReference(sub.number), summary: `Created subscription "${sub.name}"` });
  revalidatePath("/subscriptions");
  redirect(`/subscriptions/${sub.id}/edit`);
}

export async function updateSubscriptionAction(_prev: SubscriptionFormState, formData: FormData): Promise<SubscriptionFormState> {
  await requireSubscriptions();
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return { error: "Missing subscription id." };
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const refError = await validateRefs(parsed.data.typeId, parsed.data.statusId);
  if (refError) return { error: refError };
  await prisma.subscription.update({ where: { id }, data: normalizeSubscriptionInput(parsed.data) });
  await recordAudit({ action: "updated", entityType: "subscription", entityId: id, entityLabel: parsed.data.name, summary: `Updated subscription "${parsed.data.name}"` });
  revalidatePath("/subscriptions");
  redirect("/subscriptions");
}

export async function deleteSubscriptionAction(formData: FormData): Promise<void> {
  await requireSubscriptions();
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    const existing = await prisma.subscription.findUnique({ where: { id }, select: { name: true, number: true } });
    await prisma.subscription.delete({ where: { id } });
    await recordAudit({ action: "deleted", entityType: "subscription", entityId: id, entityLabel: existing ? formatSubscriptionReference(existing.number) : undefined, summary: `Deleted subscription "${existing?.name ?? id}"` });
    revalidatePath("/subscriptions");
  }
  redirect("/subscriptions");
}
