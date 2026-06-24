"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { inviteUserSchema, editUserSchema } from "@/lib/validation/user";
import { generateInviteToken } from "@/lib/auth/invite-token";
import { countActiveAdmins } from "@/lib/users/queries";
import { wouldLockOutLastAdmin } from "@/lib/users/admin-guard";

export interface InviteState {
  error?: string;
  token?: string;
}

export interface UserFormState {
  error?: string;
}

const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function inviteUserAction(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  await requirePermission("users.manage");
  const parsed = inviteUserSchema.safeParse({
    email: formData.get("email"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    roleId: formData.get("roleId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "A user with this email already exists." };

  const role = await prisma.role.findUnique({ where: { id: parsed.data.roleId } });
  if (!role) return { error: "Selected role no longer exists." };

  const { token, tokenHash } = generateInviteToken();
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone || null,
      status: "INVITED",
      roleId: parsed.data.roleId,
    },
  });
  await prisma.invitation.create({
    data: {
      email: parsed.data.email,
      roleId: parsed.data.roleId,
      tokenHash,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
      userId: user.id,
    },
  });
  revalidatePath("/settings/users");
  return { token };
}

export async function updateUserAction(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requirePermission("users.manage");
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return { error: "Missing user id." };

  const parsed = editUserSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    roleId: formData.get("roleId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const target = await prisma.user.findUnique({ where: { id }, include: { role: true } });
  if (!target) return { error: "User not found." };

  // Anti-lockout: do not demote the last active admin to a non-system role.
  const newRole = await prisma.role.findUnique({ where: { id: parsed.data.roleId } });
  if (!newRole) return { error: "Selected role no longer exists." };
  const demoting = target.role.isSystem && !newRole.isSystem && target.status === "ACTIVE";
  if (
    demoting &&
    wouldLockOutLastAdmin({
      targetIsActiveAdmin: true,
      activeAdminCount: await countActiveAdmins(),
    })
  ) {
    return { error: "Cannot change the role of the last active administrator." };
  }

  await prisma.user.update({
    where: { id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone || null,
      roleId: parsed.data.roleId,
    },
  });
  revalidatePath("/settings/users");
  redirect("/settings/users");
}

export async function setUserStatusAction(formData: FormData): Promise<void> {
  await requirePermission("users.manage");
  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || (status !== "ACTIVE" && status !== "SUSPENDED")) {
    redirect("/settings/users");
  }
  const target = await prisma.user.findUnique({ where: { id }, include: { role: true } });
  if (target) {
    const suspendingAdmin =
      status === "SUSPENDED" && target.role.isSystem && target.status === "ACTIVE";
    const locked =
      suspendingAdmin &&
      wouldLockOutLastAdmin({
        targetIsActiveAdmin: true,
        activeAdminCount: await countActiveAdmins(),
      });
    if (!locked) {
      await prisma.user.update({ where: { id }, data: { status } });
    }
  }
  revalidatePath("/settings/users");
  redirect("/settings/users");
}
