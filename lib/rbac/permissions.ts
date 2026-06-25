export const PERMISSIONS = {
  "users.read": { label: "View users", group: "Users" },
  "users.manage": { label: "Manage users", group: "Users" },
  "roles.read": { label: "View roles", group: "Roles" },
  "roles.manage": { label: "Manage roles", group: "Roles" },
  "clients.read": { label: "View clients", group: "Clients" },
  "clients.manage": { label: "Manage clients", group: "Clients" },
  "clients.assign": { label: "Assign client technician", group: "Clients" },
  "settings.manage": { label: "Manage settings", group: "Settings" },
  "tickets.read": { label: "View tickets", group: "Tickets" },
  "tickets.manage": { label: "Manage tickets", group: "Tickets" },
  "tickets.assign": { label: "Assign tickets", group: "Tickets" },
  "projects.read": { label: "View projects", group: "Projects" },
  "projects.manage": { label: "Manage projects", group: "Projects" },
  "projects.assign": { label: "Assign project tasks", group: "Projects" },
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export const PERMISSION_KEYS = Object.keys(PERMISSIONS) as PermissionKey[];
