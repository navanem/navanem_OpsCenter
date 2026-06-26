"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { contractTypeSchema, normalizeContractTypeInput } from "@/lib/validation/contract";

export interface ContractTypeState {
  error?: string;
  ok?: boolean;
}

export async function saveContractTypeAction(
  _prev: ContractTypeState,
  formData: FormData,
): Promise<ContractTypeState> {
  await requirePermission("settings.manage");
  const parsed = contractTypeSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color"),
    sortOrder: formData.get("sortOrder"),
    isActive: formData.get("isActive"),
    defaultHourlyRate: formData.get("defaultHourlyRate"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const data = normalizeContractTypeInput(parsed.data);
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    await prisma.contractType.update({ where: { id }, data });
  } else {
    await prisma.contractType.create({ data });
  }
  revalidatePath("/settings/contract-types");
  return { ok: true };
}

export async function deleteContractTypeAction(formData: FormData): Promise<void> {
  await requirePermission("settings.manage");
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    try {
      await prisma.contractType.delete({ where: { id } });
    } catch {
      // In use by a contract (FK RESTRICT) — advise deactivating instead.
    }
  }
  revalidatePath("/settings/contract-types");
}
