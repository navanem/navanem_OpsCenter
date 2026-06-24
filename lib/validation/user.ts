import { z } from "zod";

const optionalText = z.string().trim().optional().or(z.literal(""));

export const inviteUserSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  phone: optionalText,
  roleId: z.string().trim().min(1, "Role is required"),
});

export const editUserSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  phone: optionalText,
  roleId: z.string().trim().min(1, "Role is required"),
});

export const acceptInviteSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type EditUserInput = z.infer<typeof editUserSchema>;
