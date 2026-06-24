"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { roleSchema } from "@/lib/validation/role";

export interface RoleFormState {
  error?: string;
}

async function permissionConnectors(keys: string[]) {
  const perms = await prisma.permission.findMany({
    where: { key: { in: keys } },
    select: { id: true },
  });
  return perms.map((p) => ({ id: p.id }));
}

function parseRole(formData: FormData) {
  return roleSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    permissions: formData.getAll("permissions"),
  });
}

export async function createRoleAction(
  _prev: RoleFormState,
  formData: FormData,
): Promise<RoleFormState> {
  await requirePermission("roles.manage");
  const parsed = parseRole(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const connect = await permissionConnectors(parsed.data.permissions);
  await prisma.role.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      permissions: { connect },
    },
  });
  revalidatePath("/settings/roles");
  redirect("/settings/roles");
}

export async function updateRoleAction(
  _prev: RoleFormState,
  formData: FormData,
): Promise<RoleFormState> {
  await requirePermission("roles.manage");
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return { error: "Missing role id." };
  }
  const parsed = parseRole(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const connect = await permissionConnectors(parsed.data.permissions);
  await prisma.role.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      permissions: { set: connect },
    },
  });
  revalidatePath("/settings/roles");
  redirect("/settings/roles");
}

export async function deleteRoleAction(formData: FormData): Promise<void> {
  await requirePermission("roles.manage");
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (role && !role.isSystem && role._count.users === 0) {
      await prisma.role.delete({ where: { id } });
    }
  }
  revalidatePath("/settings/roles");
  redirect("/settings/roles");
}
