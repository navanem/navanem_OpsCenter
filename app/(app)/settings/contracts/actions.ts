"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { APP_SETTING_ID } from "@/lib/settings/service";

export interface ContractSettingsState {
  error?: string;
  ok?: boolean;
}

export async function updateContractSettingsAction(
  _prev: ContractSettingsState,
  formData: FormData,
): Promise<ContractSettingsState> {
  await requirePermission("settings.manage");
  const enabled = formData.get("contractsEnabled") === "true";
  await prisma.appSetting.upsert({
    where: { id: APP_SETTING_ID },
    update: { contractsEnabled: enabled },
    create: { id: APP_SETTING_ID, contractsEnabled: enabled },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
