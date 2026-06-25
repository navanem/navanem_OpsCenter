import { z } from "zod";

const optionalText = z.string().trim().optional().or(z.literal(""));

export const contactSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  jobTitle: optionalText,
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  phone: optionalText,
  isVip: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((v) => v === "on" || v === "true" || v === true),
});

export type ContactInput = z.infer<typeof contactSchema>;

function orNull(v: string | undefined): string | null {
  return v && v.length > 0 ? v : null;
}

export function normalizeContactInput(input: ContactInput) {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    jobTitle: orNull(input.jobTitle),
    email: orNull(input.email),
    phone: orNull(input.phone),
    isVip: input.isVip,
  };
}
