import { z } from "zod";

const optional = z.string().trim().optional().or(z.literal(""));

export const timeEntrySchema = z
  .object({
    date: z.string().trim().min(1, "Date is required"),
    hours: z.coerce.number().int().min(0).max(99).optional().default(0),
    minutes: z.coerce.number().int().min(0).max(59).optional().default(0),
    description: optional,
    billable: optional, // "true" when the checkbox is checked
    hourlyRate: optional, // e.g. "120" or "120.50"
    ticketId: optional,
    taskId: optional,
    visitId: optional,
    clientId: optional,
  })
  .refine((d) => (d.hours ?? 0) * 60 + (d.minutes ?? 0) > 0, {
    message: "Duration must be greater than zero",
    path: ["minutes"],
  });
export type TimeEntryInput = z.infer<typeof timeEntrySchema>;

function orNull(v?: string): string | null {
  return v && v.length > 0 ? v : null;
}

export function rateToCents(v?: string): number | null {
  if (!v || v.trim().length === 0) return null;
  const n = Number(v.replace(",", "."));
  if (isNaN(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function normalizeTimeEntryInput(input: TimeEntryInput) {
  return {
    date: new Date(input.date),
    minutes: (input.hours ?? 0) * 60 + (input.minutes ?? 0),
    description: orNull(input.description),
    billable: input.billable === "true",
    hourlyRateCents: rateToCents(input.hourlyRate),
    ticketId: orNull(input.ticketId),
    taskId: orNull(input.taskId),
    visitId: orNull(input.visitId),
    clientId: orNull(input.clientId),
  };
}
