"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { APP_SETTING_ID } from "@/lib/settings/service";

export interface ChangeSettingsState {
  error?: string;
  ok?: boolean;
}

export async function updateChangeSettingsAction(
  _prev: ChangeSettingsState,
  formData: FormData,
): Promise<ChangeSettingsState> {
  await requirePermission("settings.manage");
  const enabled = formData.get("changesEnabled") === "true";
  await prisma.appSetting.upsert({
    where: { id: APP_SETTING_ID },
    update: { changesEnabled: enabled },
    create: { id: APP_SETTING_ID, changesEnabled: enabled },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
