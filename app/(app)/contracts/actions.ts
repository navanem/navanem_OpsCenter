"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { isContractsEnabled } from "@/lib/settings/service";
import { contractSchema, normalizeContractInput } from "@/lib/validation/contract";

export interface ContractFormState {
  error?: string;
}

async function requireContracts() {
  const user = await requirePermission("contracts.manage");
  if (!(await isContractsEnabled())) redirect("/dashboard");
  return user;
}

function parseForm(formData: FormData) {
  return contractSchema.safeParse({
    name: formData.get("name"),
    clientId: formData.get("clientId"),
    typeId: formData.get("typeId"),
    statusId: formData.get("statusId"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    value: formData.get("value"),
    billingCycle: formData.get("billingCycle"),
    includedHours: formData.get("includedHours"),
    notes: formData.get("notes"),
  });
}

async function validateRefs(typeId: string, statusId: string): Promise<string | null> {
  const [type, status] = await Promise.all([
    prisma.contractType.findUnique({ where: { id: typeId } }),
    prisma.contractStatus.findUnique({ where: { id: statusId } }),
  ]);
  if (!type) return "Selected contract type no longer exists.";
  if (!status) return "Selected status no longer exists.";
  return null;
}

export async function createContractAction(
  _prev: ContractFormState,
  formData: FormData,
): Promise<ContractFormState> {
  await requireContracts();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const refError = await validateRefs(parsed.data.typeId, parsed.data.statusId);
  if (refError) return { error: refError };
  const contract = await prisma.contract.create({ data: normalizeContractInput(parsed.data) });
  revalidatePath("/contracts");
  redirect(`/contracts/${contract.id}/edit`);
}

export async function updateContractAction(
  _prev: ContractFormState,
  formData: FormData,
): Promise<ContractFormState> {
  await requireContracts();
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return { error: "Missing contract id." };
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const refError = await validateRefs(parsed.data.typeId, parsed.data.statusId);
  if (refError) return { error: refError };
  await prisma.contract.update({ where: { id }, data: normalizeContractInput(parsed.data) });
  revalidatePath("/contracts");
  redirect("/contracts");
}

export async function deleteContractAction(formData: FormData): Promise<void> {
  await requireContracts();
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    await prisma.contract.delete({ where: { id } });
    revalidatePath("/contracts");
  }
  redirect("/contracts");
}
