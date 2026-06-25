"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { taxonomyWithColorSchema, industrySchema } from "@/lib/validation/taxonomy";

export interface TaxonomyState {
  error?: string;
  ok?: boolean;
}

type Kind = "category" | "priority" | "industry";

function isKind(v: FormDataEntryValue | null): v is Kind {
  return v === "category" || v === "priority" || v === "industry";
}

export async function saveTaxonomyAction(
  _prev: TaxonomyState,
  formData: FormData,
): Promise<TaxonomyState> {
  await requirePermission("settings.manage");

  const kind = formData.get("kind");
  if (!isKind(kind)) return { error: "Invalid type." };

  const id = formData.get("id");
  const editing = typeof id === "string" && id.length > 0;

  if (kind === "industry") {
    const parsed = industrySchema.safeParse({
      name: formData.get("name"),
      sortOrder: formData.get("sortOrder"),
      isActive: formData.get("isActive"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
    const data = {
      name: parsed.data.name,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    };
    if (editing) await prisma.clientIndustry.update({ where: { id: id as string }, data });
    else await prisma.clientIndustry.create({ data });
  } else {
    const parsed = taxonomyWithColorSchema.safeParse({
      name: formData.get("name"),
      color: formData.get("color"),
      sortOrder: formData.get("sortOrder"),
      isActive: formData.get("isActive"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
    const data = {
      name: parsed.data.name,
      color: parsed.data.color,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
    };
    if (kind === "category") {
      if (editing) await prisma.ticketCategory.update({ where: { id: id as string }, data });
      else await prisma.ticketCategory.create({ data });
    } else {
      if (editing) await prisma.ticketPriority.update({ where: { id: id as string }, data });
      else await prisma.ticketPriority.create({ data });
    }
  }

  revalidatePath("/settings/taxonomies");
  return { ok: true };
}

export async function deleteTaxonomyAction(formData: FormData): Promise<void> {
  await requirePermission("settings.manage");

  const kind = formData.get("kind");
  const id = formData.get("id");

  if (isKind(kind) && typeof id === "string" && id.length > 0) {
    try {
      if (kind === "category") await prisma.ticketCategory.delete({ where: { id } });
      else if (kind === "priority") await prisma.ticketPriority.delete({ where: { id } });
      else await prisma.clientIndustry.delete({ where: { id } });
    } catch {
      // A category/priority still referenced by tickets cannot be deleted (FK RESTRICT).
      // The UI advises deactivating instead. Swallow to avoid a crash.
    }
  }

  revalidatePath("/settings/taxonomies");
}
