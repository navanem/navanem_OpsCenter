"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { APP_SETTING_ID } from "@/lib/settings/service";

export interface CrmSettingsState {
  error?: string;
  ok?: boolean;
}

export async function updateCrmSettingsAction(
  _prev: CrmSettingsState,
  formData: FormData,
): Promise<CrmSettingsState> {
  await requirePermission("settings.manage");
  const enabled = formData.get("crmEnabled") === "true";
  await prisma.appSetting.upsert({
    where: { id: APP_SETTING_ID },
    update: { crmEnabled: enabled },
    create: { id: APP_SETTING_ID, crmEnabled: enabled },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
