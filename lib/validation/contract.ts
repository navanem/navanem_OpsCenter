import { z } from "zod";
import { moneyToCents } from "@/lib/contracts/meta";

const optional = z.string().trim().optional().or(z.literal(""));

export const contractSchema = z.object({
  name: optional,
  clientId: z.string().trim().min(1, "Client is required"),
  typeId: z.string().trim().min(1, "Type is required"),
  statusId: z.string().trim().min(1, "Status is required"),
  startDate: z.string().trim().min(1, "Start date is required"),
  endDate: optional,
  value: optional, // e.g. "1200.00"
  billingCycle: z.enum(["MONTHLY", "QUARTERLY", "YEARLY", "ONE_OFF"]).optional().default("MONTHLY"),
  includedHours: optional, // hours per period, e.g. "10" or "10.5"
  notes: optional,
});
export type ContractInput = z.infer<typeof contractSchema>;

function orNull(v?: string): string | null {
  return v && v.length > 0 ? v : null;
}
function dateOrNull(v?: string): Date | null {
  if (!v || v.length === 0) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
function hoursToMinutes(v?: string): number | null {
  if (!v || v.trim().length === 0) return null;
  const n = Number(v.replace(",", "."));
  if (isNaN(n) || n < 0) return null;
  return Math.round(n * 60);
}

export function normalizeContractInput(input: ContractInput) {
  return {
    name: orNull(input.name),
    clientId: input.clientId,
    typeId: input.typeId,
    statusId: input.statusId,
    startDate: new Date(input.startDate),
    endDate: dateOrNull(input.endDate),
    valueCents: moneyToCents(input.value),
    billingCycle: input.billingCycle,
    includedMinutesPerPeriod: hoursToMinutes(input.includedHours),
    notes: orNull(input.notes),
  };
}
