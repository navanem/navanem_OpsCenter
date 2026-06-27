import { z } from "zod";

const optional = z.string().trim().optional().or(z.literal(""));

export const changeSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: optional,
  typeId: optional,
  statusId: z.string().trim().min(1, "Status is required"),
  clientId: optional,
  assigneeId: optional,
  risk: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().or(z.literal("")),
  impact: optional,
  plannedStart: optional,
  plannedEnd: optional,
  implementationPlan: optional,
  rollbackPlan: optional,
});
export type ChangeInput = z.infer<typeof changeSchema>;

function orNull(v?: string): string | null {
  return v && v.length > 0 ? v : null;
}
function dateOrNull(v?: string): Date | null {
  if (!v || v.length === 0) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export function normalizeChangeInput(input: ChangeInput) {
  return {
    title: input.title,
    description: orNull(input.description),
    typeId: orNull(input.typeId),
    statusId: input.statusId,
    clientId: orNull(input.clientId),
    assigneeId: orNull(input.assigneeId),
    risk: input.risk && input.risk.length > 0 ? input.risk : null,
    impact: orNull(input.impact),
    plannedStart: dateOrNull(input.plannedStart),
    plannedEnd: dateOrNull(input.plannedEnd),
    implementationPlan: orNull(input.implementationPlan),
    rollbackPlan: orNull(input.rollbackPlan),
  };
}
