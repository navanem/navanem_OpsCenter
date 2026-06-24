import { prisma } from "@/lib/db";

const SINGLETON_ID = "singleton";

export function getAppSettings() {
  return prisma.appSetting.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });
}

export const APP_SETTING_ID = SINGLETON_ID;
