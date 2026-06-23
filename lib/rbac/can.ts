import type { PermissionKey } from "./permissions";

export interface AuthUser {
  id: string;
  email: string;
  permissions: string[];
}

export function can(
  user: AuthUser | null | undefined,
  permission: PermissionKey,
): boolean {
  if (!user) return false;
  return user.permissions.includes(permission);
}
