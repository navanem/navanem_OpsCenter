import { z } from "zod";

const hexColor = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex value like #3b82f6");
const sortOrder = z.coerce.number().int().min(0).default(0);
const isActive = z
  .union([z.literal("true"), z.literal("false"), z.boolean()])
  .optional()
  .transform((v) => v === undefined ? true : v === true || v === "true");

export const taxonomyWithColorSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  color: hexColor,
  sortOrder,
  isActive,
});

export const industrySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  sortOrder,
  isActive,
});

export type TaxonomyWithColorInput = z.infer<typeof taxonomyWithColorSchema>;
export type IndustryInput = z.infer<typeof industrySchema>;
