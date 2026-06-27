"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { isDevicesEnabled } from "@/lib/settings/service";
import { deviceSchema, normalizeDeviceInput } from "@/lib/validation/device";
import { recordAudit } from "@/lib/audit/log";
import { formatDeviceReference } from "@/lib/devices/meta";

export interface DeviceFormState {
  error?: string;
}

async function requireDevices() {
  const user = await requirePermission("devices.manage");
  if (!(await isDevicesEnabled())) redirect("/dashboard");
  return user;
}

function parseForm(formData: FormData) {
  return deviceSchema.safeParse({
    name: formData.get("name"),
    typeId: formData.get("typeId"),
    statusId: formData.get("statusId"),
    clientId: formData.get("clientId"),
    serialNumber: formData.get("serialNumber"),
    manufacturer: formData.get("manufacturer"),
    model: formData.get("model"),
    hostname: formData.get("hostname"),
    purchaseDate: formData.get("purchaseDate"),
    warrantyExpiry: formData.get("warrantyExpiry"),
    notes: formData.get("notes"),
  });
}

async function validateRefs(typeId: string, statusId: string): Promise<string | null> {
  const [type, status] = await Promise.all([
    prisma.deviceType.findUnique({ where: { id: typeId } }),
    prisma.deviceStatus.findUnique({ where: { id: statusId } }),
  ]);
  if (!type) return "Selected device type no longer exists.";
  if (!status) return "Selected status no longer exists.";
  return null;
}

export async function createDeviceAction(_prev: DeviceFormState, formData: FormData): Promise<DeviceFormState> {
  await requireDevices();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const refError = await validateRefs(parsed.data.typeId, parsed.data.statusId);
  if (refError) return { error: refError };
  const device = await prisma.device.create({ data: normalizeDeviceInput(parsed.data) });
  await recordAudit({ action: "created", entityType: "device", entityId: device.id, entityLabel: formatDeviceReference(device.number), summary: `Created device "${device.name}"` });
  revalidatePath("/devices");
  redirect(`/devices/${device.id}/edit`);
}

export async function updateDeviceAction(_prev: DeviceFormState, formData: FormData): Promise<DeviceFormState> {
  await requireDevices();
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return { error: "Missing device id." };
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const refError = await validateRefs(parsed.data.typeId, parsed.data.statusId);
  if (refError) return { error: refError };
  await prisma.device.update({ where: { id }, data: normalizeDeviceInput(parsed.data) });
  await recordAudit({ action: "updated", entityType: "device", entityId: id, entityLabel: parsed.data.name, summary: `Updated device "${parsed.data.name}"` });
  revalidatePath("/devices");
  redirect("/devices");
}

export async function deleteDeviceAction(formData: FormData): Promise<void> {
  await requireDevices();
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    const existing = await prisma.device.findUnique({ where: { id }, select: { name: true, number: true } });
    await prisma.device.delete({ where: { id } });
    await recordAudit({ action: "deleted", entityType: "device", entityId: id, entityLabel: existing ? formatDeviceReference(existing.number) : undefined, summary: `Deleted device "${existing?.name ?? id}"` });
    revalidatePath("/devices");
  }
  redirect("/devices");
}
