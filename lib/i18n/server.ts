import "server-only";
import { cache } from "react";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCurrentContact } from "@/lib/portal/current-contact";
import { getAppSettings } from "@/lib/settings/service";
import { normalizeLocale, type Locale } from "./config";
import { en, type Dictionary } from "./dictionaries/en";
import { fr } from "./dictionaries/fr";

const dicts: Record<Locale, Dictionary> = { en, fr };

// Resolves the active locale from the signed-in principal (staff user → portal
// contact → org default). Cached per request so it runs at most once.
export const getLocale = cache(async (): Promise<Locale> => {
  const user = await getCurrentUser();
  if (user) return normalizeLocale(user.locale);
  const contact = await getCurrentContact();
  if (contact) return normalizeLocale(contact.locale);
  const settings = await getAppSettings();
  return normalizeLocale(settings.defaultLocale);
});

export async function getDictionary(): Promise<Dictionary> {
  return dicts[await getLocale()];
}

export function dictionaryFor(locale: Locale): Dictionary {
  return dicts[locale];
}
