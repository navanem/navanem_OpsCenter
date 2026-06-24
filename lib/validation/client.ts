import { z } from "zod";

const optionalText = z.string().trim().optional().or(z.literal(""));

export const clientSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  domain: optionalText,
  contactName: optionalText,
  contactEmail: z
    .string()
    .trim()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),
  contactPhone: optionalText,
  address: optionalText,
  city: optionalText,
  postalCode: optionalText,
  country: optionalText,
  status: z.enum(["ACTIVE", "INACTIVE"]),
  assignedTechnicianId: optionalText,
  notes: optionalText,
});

export type ClientInput = z.infer<typeof clientSchema>;

function orNull(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null;
}

export function normalizeClientInput(input: ClientInput) {
  return {
    companyName: input.companyName,
    domain: orNull(input.domain),
    contactName: orNull(input.contactName),
    contactEmail: orNull(input.contactEmail),
    contactPhone: orNull(input.contactPhone),
    address: orNull(input.address),
    city: orNull(input.city),
    postalCode: orNull(input.postalCode),
    country: orNull(input.country),
    status: input.status,
    assignedTechnicianId: orNull(input.assignedTechnicianId),
    notes: orNull(input.notes),
  };
}
