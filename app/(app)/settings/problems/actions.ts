"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { APP_SETTING_ID } from "@/lib/settings/service";

export interface ProblemSettingsState {
  error?: string;
  ok?: boolean;
}

export async function updateProblemSettingsAction(
  _prev: ProblemSettingsState,
  formData: FormData,
): Promise<ProblemSettingsState> {
  await requirePermission("settings.manage");
  const enabled = formData.get("problemsEnabled") === "true";
  await prisma.appSetting.upsert({
    where: { id: APP_SETTING_ID },
    update: { problemsEnabled: enabled },
    create: { id: APP_SETTING_ID, problemsEnabled: enabled },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
