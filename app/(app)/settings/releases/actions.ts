"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { APP_SETTING_ID } from "@/lib/settings/service";

export interface ReleaseSettingsState {
  error?: string;
  ok?: boolean;
}

export async function updateReleaseSettingsAction(
  _prev: ReleaseSettingsState,
  formData: FormData,
): Promise<ReleaseSettingsState> {
  await requirePermission("settings.manage");
  const enabled = formData.get("releasesEnabled") === "true";
  await prisma.appSetting.upsert({
    where: { id: APP_SETTING_ID },
    update: { releasesEnabled: enabled },
    create: { id: APP_SETTING_ID, releasesEnabled: enabled },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
