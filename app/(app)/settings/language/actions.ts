"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser, requirePermission } from "@/lib/auth/guard";
import { APP_SETTING_ID } from "@/lib/settings/service";
import { normalizeLocale } from "@/lib/i18n/config";

export async function updateMyLocaleAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const locale = normalizeLocale(formData.get("locale"));
  await prisma.user.update({ where: { id: user.id }, data: { locale } });
  revalidatePath("/", "layout");
  redirect("/settings/language");
}

// Same as above but stays on the current page (used by the top-bar user menu).
export async function setMyLocaleAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const locale = normalizeLocale(formData.get("locale"));
  await prisma.user.update({ where: { id: user.id }, data: { locale } });
  revalidatePath("/", "layout");
}

export async function updateDefaultLocaleAction(formData: FormData): Promise<void> {
  await requirePermission("settings.manage");
  const locale = normalizeLocale(formData.get("locale"));
  await prisma.appSetting.upsert({
    where: { id: APP_SETTING_ID },
    update: { defaultLocale: locale },
    create: { id: APP_SETTING_ID, defaultLocale: locale },
  });
  revalidatePath("/", "layout");
  redirect("/settings/language");
}
