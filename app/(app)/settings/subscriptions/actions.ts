"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { APP_SETTING_ID } from "@/lib/settings/service";

export interface SubscriptionSettingsState {
  error?: string;
  ok?: boolean;
}

export async function updateSubscriptionSettingsAction(
  _prev: SubscriptionSettingsState,
  formData: FormData,
): Promise<SubscriptionSettingsState> {
  await requirePermission("settings.manage");
  const enabled = formData.get("subscriptionsEnabled") === "true";
  await prisma.appSetting.upsert({
    where: { id: APP_SETTING_ID },
    update: { subscriptionsEnabled: enabled },
    create: { id: APP_SETTING_ID, subscriptionsEnabled: enabled },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
