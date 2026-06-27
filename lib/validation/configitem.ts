import { z } from "zod";

const optional = z.string().trim().optional().or(z.literal(""));

export const configItemSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  typeId: optional,
  statusId: optional,
  clientId: optional,
  deviceId: optional,
  environment: optional,
  location: optional,
  owner: optional,
  description: optional,
});
export type ConfigItemInput = z.infer<typeof configItemSchema>;

function orNull(v?: string): string | null {
  return v && v.length > 0 ? v : null;
}

export function normalizeConfigItemInput(input: ConfigItemInput) {
  return {
    name: input.name,
    typeId: orNull(input.typeId),
    statusId: orNull(input.statusId),
    clientId: orNull(input.clientId),
    deviceId: orNull(input.deviceId),
    environment: orNull(input.environment),
    location: orNull(input.location),
    owner: orNull(input.owner),
    description: orNull(input.description),
  };
}

// Parse the multi-value relatedTo field into a deduped list of CI ids.
export function parseRelatedIds(values: FormDataEntryValue[]): string[] {
  return [...new Set(values.filter((v): v is string => typeof v === "string" && v.length > 0))];
}
