"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { APP_SETTING_ID } from "@/lib/settings/service";

export interface DeviceSettingsState {
  error?: string;
  ok?: boolean;
}

export async function updateDeviceSettingsAction(
  _prev: DeviceSettingsState,
  formData: FormData,
): Promise<DeviceSettingsState> {
  await requirePermission("settings.manage");
  const enabled = formData.get("devicesEnabled") === "true";
  await prisma.appSetting.upsert({
    where: { id: APP_SETTING_ID },
    update: { devicesEnabled: enabled },
    create: { id: APP_SETTING_ID, devicesEnabled: enabled },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
