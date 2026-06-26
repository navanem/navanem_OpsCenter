import { z } from "zod";
import { moneyToCents } from "@/lib/contracts/meta";

const optional = z.string().trim().optional().or(z.literal(""));

export const subscriptionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  typeId: z.string().trim().min(1, "Type is required"),
  statusId: z.string().trim().min(1, "Status is required"),
  clientId: optional,
  provider: optional,
  reference: optional,
  cost: optional,
  billingCycle: z.enum(["MONTHLY", "QUARTERLY", "YEARLY", "ONE_OFF"]).optional().default("MONTHLY"),
  seats: optional,
  startDate: optional,
  renewalDate: optional,
  autoRenew: z.boolean().optional().default(false),
  supportLevel: optional,
  warrantyEnd: optional,
  notes: optional,
});
export type SubscriptionInput = z.infer<typeof subscriptionSchema>;

function orNull(v?: string): string | null {
  return v && v.length > 0 ? v : null;
}
function dateOrNull(v?: string): Date | null {
  if (!v || v.length === 0) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
function intOrNull(v?: string): number | null {
  if (!v || v.length === 0) return null;
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}

export function normalizeSubscriptionInput(input: SubscriptionInput) {
  return {
    name: input.name,
    typeId: input.typeId,
    statusId: input.statusId,
    clientId: orNull(input.clientId),
    provider: orNull(input.provider),
    reference: orNull(input.reference),
    costCents: moneyToCents(input.cost),
    billingCycle: input.billingCycle,
    seats: intOrNull(input.seats),
    startDate: dateOrNull(input.startDate),
    renewalDate: dateOrNull(input.renewalDate),
    autoRenew: input.autoRenew,
    supportLevel: orNull(input.supportLevel),
    warrantyEnd: dateOrNull(input.warrantyEnd),
    notes: orNull(input.notes),
  };
}
