import { prisma } from "@/lib/db";

const SINGLETON_ID = "singleton";

export function getAppSettings() {
  return prisma.appSetting.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });
}

export async function isTimesheetingEnabled(): Promise<boolean> {
  const settings = await getAppSettings();
  return settings.timesheetingEnabled;
}

export async function isContractsEnabled(): Promise<boolean> {
  const settings = await getAppSettings();
  return settings.contractsEnabled;
}

export async function isDevicesEnabled(): Promise<boolean> {
  const settings = await getAppSettings();
  return settings.devicesEnabled;
}

export async function isSubscriptionsEnabled(): Promise<boolean> {
  const settings = await getAppSettings();
  return settings.subscriptionsEnabled;
}

export async function isChangesEnabled(): Promise<boolean> {
  const settings = await getAppSettings();
  return settings.changesEnabled;
}

export async function isCmdbEnabled(): Promise<boolean> {
  const settings = await getAppSettings();
  return settings.cmdbEnabled;
}

export async function isCrmEnabled(): Promise<boolean> {
  const settings = await getAppSettings();
  return settings.crmEnabled;
}

export const APP_SETTING_ID = SINGLETON_ID;
