import { z } from "zod";

const optional = z.string().trim().optional().or(z.literal(""));

export const releaseSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  version: optional,
  description: optional,
  typeId: optional,
  statusId: z.string().trim().min(1, "Status is required"),
  clientId: optional,
  ownerId: optional,
  plannedDate: optional,
  releasedDate: optional,
  releaseNotes: optional,
  rollbackPlan: optional,
});
export type ReleaseInput = z.infer<typeof releaseSchema>;

function orNull(v?: string): string | null {
  return v && v.length > 0 ? v : null;
}
function dateOrNull(v?: string): Date | null {
  if (!v || v.length === 0) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export function normalizeReleaseInput(input: ReleaseInput) {
  return {
    name: input.name,
    version: orNull(input.version),
    description: orNull(input.description),
    typeId: orNull(input.typeId),
    statusId: input.statusId,
    clientId: orNull(input.clientId),
    ownerId: orNull(input.ownerId),
    plannedDate: dateOrNull(input.plannedDate),
    releasedDate: dateOrNull(input.releasedDate),
    releaseNotes: orNull(input.releaseNotes),
    rollbackPlan: orNull(input.rollbackPlan),
  };
}
