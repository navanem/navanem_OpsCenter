import { z } from "zod";

const optional = z.string().trim().optional().or(z.literal(""));

export const projectSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: optional,
  clientId: optional,
  statusId: z.string().trim().min(1, "Status is required"),
  leadId: optional,
  startDate: optional,
  dueDate: optional,
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const taskSchema = z.object({
  projectId: z.string().trim().min(1, "Project is required"),
  title: z.string().trim().min(1, "Title is required"),
  description: optional,
  statusId: z.string().trim().min(1, "Status is required"),
  assigneeId: optional,
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  startDate: optional,
  dueDate: optional,
});
export type TaskInput = z.infer<typeof taskSchema>;

function orNull(v: string | undefined): string | null {
  return v && v.length > 0 ? v : null;
}
function dateOrNull(v: string | undefined): Date | null {
  if (!v || v.length === 0) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export function normalizeProjectInput(input: ProjectInput) {
  return {
    name: input.name,
    description: orNull(input.description),
    clientId: orNull(input.clientId),
    statusId: input.statusId,
    leadId: orNull(input.leadId),
    startDate: dateOrNull(input.startDate),
    dueDate: dateOrNull(input.dueDate),
  };
}

export function normalizeTaskInput(input: TaskInput) {
  return {
    title: input.title,
    description: orNull(input.description),
    statusId: input.statusId,
    assigneeId: orNull(input.assigneeId),
    priority: input.priority,
    startDate: dateOrNull(input.startDate),
    dueDate: dateOrNull(input.dueDate),
  };
}
