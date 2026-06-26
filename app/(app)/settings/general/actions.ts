"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { generalSettingsSchema } from "@/lib/validation/settings";
import { APP_SETTING_ID } from "@/lib/settings/service";

export interface GeneralState {
  error?: string;
  ok?: boolean;
}

const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_LOGO_BYTES = 1024 * 1024; // 1 MB

export async function updateGeneralAction(
  _prev: GeneralState,
  formData: FormData,
): Promise<GeneralState> {
  await requirePermission("settings.manage");
  const parsed = generalSettingsSchema.safeParse({ companyName: formData.get("companyName") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const data: {
    companyName: string;
    logoData?: Uint8Array<ArrayBuffer>;
    logoMimeType?: string;
  } = {
    companyName: parsed.data.companyName,
  };

  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    if (!ALLOWED_LOGO_TYPES.includes(logo.type)) {
      return { error: "Logo must be a PNG, JPEG, WebP, or SVG image." };
    }
    if (logo.size > MAX_LOGO_BYTES) {
      return { error: "Logo must be 1 MB or smaller." };
    }
    data.logoData = new Uint8Array(await logo.arrayBuffer() as ArrayBuffer);
    data.logoMimeType = logo.type;
  }

  await prisma.appSetting.upsert({
    where: { id: APP_SETTING_ID },
    update: data,
    create: { id: APP_SETTING_ID, ...data },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
