"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guard";
import { encryptSecret } from "@/lib/crypto/secret";
import { newTotpSecret } from "@/lib/auth/totp";

export async function beginForcedSetupAction(): Promise<void> {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: encryptSecret(newTotpSecret()), totpEnabled: false },
  });
  redirect("/setup-2fa");
}
