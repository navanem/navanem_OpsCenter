"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { APP_SETTING_ID } from "@/lib/settings/service";
import { rateToCents } from "@/lib/validation/timesheet";

export interface ModuleSettingsState {
  error?: string;
  ok?: boolean;
}

export async function updateTimesheetSettingsAction(
  _prev: ModuleSettingsState,
  formData: FormData,
): Promise<ModuleSettingsState> {
  await requirePermission("settings.manage");
  const enabled = formData.get("timesheetingEnabled") === "true";
  const rate = formData.get("defaultHourlyRate");
  const defaultHourlyRateCents = typeof rate === "string" ? rateToCents(rate) : null;
  await prisma.appSetting.upsert({
    where: { id: APP_SETTING_ID },
    update: { timesheetingEnabled: enabled, defaultHourlyRateCents },
    create: { id: APP_SETTING_ID, timesheetingEnabled: enabled, defaultHourlyRateCents },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
