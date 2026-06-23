export const PERMISSIONS = {
  "users.read": { label: "View users", group: "Users" },
  "users.manage": { label: "Manage users", group: "Users" },
  "roles.read": { label: "View roles", group: "Roles" },
  "roles.manage": { label: "Manage roles", group: "Roles" },
  "clients.read": { label: "View clients", group: "Clients" },
  "clients.manage": { label: "Manage clients", group: "Clients" },
  "clients.assign": { label: "Assign client technician", group: "Clients" },
  "settings.manage": { label: "Manage settings", group: "Settings" },
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export const PERMISSION_KEYS = Object.keys(PERMISSIONS) as PermissionKey[];
