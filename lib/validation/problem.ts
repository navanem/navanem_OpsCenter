import { z } from "zod";

const optional = z.string().trim().optional().or(z.literal(""));

export const problemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: optional,
  typeId: optional,
  statusId: z.string().trim().min(1, "Status is required"),
  clientId: optional,
  assigneeId: optional,
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional().or(z.literal("")),
  impact: optional,
  rootCause: optional,
  workaround: optional,
  resolution: optional,
  knownError: optional,
});
export type ProblemInput = z.infer<typeof problemSchema>;

function orNull(v?: string): string | null {
  return v && v.length > 0 ? v : null;
}

export function normalizeProblemInput(input: ProblemInput) {
  const resolution = orNull(input.resolution);
  return {
    title: input.title,
    description: orNull(input.description),
    typeId: orNull(input.typeId),
    statusId: input.statusId,
    clientId: orNull(input.clientId),
    assigneeId: orNull(input.assigneeId),
    priority: input.priority && input.priority.length > 0 ? input.priority : null,
    impact: orNull(input.impact),
    rootCause: orNull(input.rootCause),
    workaround: orNull(input.workaround),
    resolution,
    knownError: input.knownError === "true" || input.knownError === "on",
    resolvedAt: resolution ? new Date() : null,
  };
}
