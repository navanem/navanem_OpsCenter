import { z } from "zod";

const optional = z.string().trim().optional().or(z.literal(""));

export const deviceSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  typeId: z.string().trim().min(1, "Type is required"),
  statusId: z.string().trim().min(1, "Status is required"),
  clientId: optional,
  serialNumber: optional,
  manufacturer: optional,
  model: optional,
  hostname: optional,
  purchaseDate: optional,
  warrantyExpiry: optional,
  notes: optional,
});
export type DeviceInput = z.infer<typeof deviceSchema>;

function orNull(v?: string): string | null {
  return v && v.length > 0 ? v : null;
}
function dateOrNull(v?: string): Date | null {
  if (!v || v.length === 0) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export function normalizeDeviceInput(input: DeviceInput) {
  return {
    name: input.name,
    typeId: input.typeId,
    statusId: input.statusId,
    clientId: orNull(input.clientId),
    serialNumber: orNull(input.serialNumber),
    manufacturer: orNull(input.manufacturer),
    model: orNull(input.model),
    hostname: orNull(input.hostname),
    purchaseDate: dateOrNull(input.purchaseDate),
    warrantyExpiry: dateOrNull(input.warrantyExpiry),
    notes: orNull(input.notes),
  };
}
