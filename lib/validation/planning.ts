import { z } from "zod";

const optional = z.string().trim().optional().or(z.literal(""));
const intField = z.coerce.number().int();

export const visitSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: optional,
  typeId: z.string().trim().min(1, "Type is required"),
  clientId: optional,
  assigneeId: optional,
  location: optional,
  scheduledAt: z.string().trim().min(1, "Date & time is required"),
  durationMinutes: intField.optional().default(60),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED"]).optional().default("SCHEDULED"),
  notes: optional,
});
export type VisitInput = z.infer<typeof visitSchema>;

export const recurringVisitSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: optional,
  typeId: z.string().trim().min(1, "Type is required"),
  clientId: optional,
  assigneeId: optional,
  location: optional,
  durationMinutes: intField.optional().default(60),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  interval: intField.min(1).optional().default(1),
  weekdays: z.array(z.coerce.number().int().min(0).max(6)).optional().default([]),
  startDate: z.string().trim().min(1, "Start date is required"),
  endDate: optional,
  timeHour: intField.min(0).max(23).optional().default(9),
  timeMinute: intField.min(0).max(59).optional().default(0),
});
export type RecurringVisitInput = z.infer<typeof recurringVisitSchema>;

function orNull(v: string | undefined): string | null {
  return v && v.length > 0 ? v : null;
}
function dateOrNull(v: string | undefined): Date | null {
  if (!v || v.length === 0) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export function normalizeVisitInput(input: VisitInput) {
  return {
    title: input.title,
    description: orNull(input.description),
    typeId: input.typeId,
    clientId: orNull(input.clientId),
    assigneeId: orNull(input.assigneeId),
    location: orNull(input.location),
    scheduledAt: new Date(input.scheduledAt),
    durationMinutes: input.durationMinutes,
    status: input.status,
    notes: orNull(input.notes),
  };
}

export function normalizeRecurringInput(input: RecurringVisitInput) {
  return {
    title: input.title,
    description: orNull(input.description),
    typeId: input.typeId,
    clientId: orNull(input.clientId),
    assigneeId: orNull(input.assigneeId),
    location: orNull(input.location),
    durationMinutes: input.durationMinutes,
    frequency: input.frequency,
    interval: input.interval,
    weekdays: input.frequency === "WEEKLY" ? input.weekdays : [],
    startDate: new Date(input.startDate),
    endDate: dateOrNull(input.endDate),
    timeHour: input.timeHour,
    timeMinute: input.timeMinute,
  };
}
