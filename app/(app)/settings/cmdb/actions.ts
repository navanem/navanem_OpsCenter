"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { APP_SETTING_ID } from "@/lib/settings/service";

export interface CmdbSettingsState {
  error?: string;
  ok?: boolean;
}

export async function updateCmdbSettingsAction(
  _prev: CmdbSettingsState,
  formData: FormData,
): Promise<CmdbSettingsState> {
  await requirePermission("settings.manage");
  const enabled = formData.get("cmdbEnabled") === "true";
  await prisma.appSetting.upsert({
    where: { id: APP_SETTING_ID },
    update: { cmdbEnabled: enabled },
    create: { id: APP_SETTING_ID, cmdbEnabled: enabled },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
