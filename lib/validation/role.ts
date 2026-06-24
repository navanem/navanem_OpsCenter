import { z } from "zod";
import { PERMISSION_KEYS } from "@/lib/rbac/permissions";

const validKeys = new Set<string>(PERMISSION_KEYS);

export const roleSchema = z.object({
  name: z.string().trim().min(1, "Role name is required"),
  description: z.string().trim().optional().or(z.literal("")),
  permissions: z
    .array(z.string())
    .default([])
    .transform((arr) => arr.filter((k) => validKeys.has(k))),
});

export type RoleInput = z.infer<typeof roleSchema>;
