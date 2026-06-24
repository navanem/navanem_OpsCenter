import { z } from "zod";

export const generalSettingsSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
});

const optionalText = z.string().trim().optional().or(z.literal(""));

const portField = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (v) => v === undefined || v === "" || (/^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 65535),
    "Port must be a number between 1 and 65535",
  );

export const smtpSettingsSchema = z.object({
  smtpHost: optionalText,
  smtpPort: portField,
  smtpUser: optionalText,
  smtpPassword: z.string().optional().or(z.literal("")), // blank = keep existing
  smtpFrom: z.string().trim().email("Invalid from address").optional().or(z.literal("")),
  smtpSecure: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional(),
});

export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>;
export type SmtpSettingsInput = z.infer<typeof smtpSettingsSchema>;
