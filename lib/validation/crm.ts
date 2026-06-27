import { z } from "zod";
import { moneyToCents } from "@/lib/crm/meta";

const optional = z.string().trim().optional().or(z.literal(""));

function orNull(v?: string): string | null {
  return v && v.length > 0 ? v : null;
}
function dateOrNull(v?: string): Date | null {
  if (!v || v.length === 0) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export const leadSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  contactName: optional,
  email: optional,
  phone: optional,
  sourceId: optional,
  statusId: optional,
  ownerId: optional,
  estimatedValue: optional,
  notes: optional,
});
export type LeadInput = z.infer<typeof leadSchema>;

export function normalizeLeadInput(input: LeadInput) {
  return {
    companyName: input.companyName,
    contactName: orNull(input.contactName),
    email: orNull(input.email),
    phone: orNull(input.phone),
    sourceId: orNull(input.sourceId),
    statusId: orNull(input.statusId),
    ownerId: orNull(input.ownerId),
    estimatedValueCents: moneyToCents(input.estimatedValue),
    notes: orNull(input.notes),
  };
}

export const opportunitySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  clientId: optional,
  stageId: optional,
  ownerId: optional,
  value: optional,
  probability: optional,
  outcome: z.enum(["OPEN", "WON", "LOST"]).optional().or(z.literal("")),
  expectedCloseAt: optional,
  notes: optional,
});
export type OpportunityInput = z.infer<typeof opportunitySchema>;

function probabilityOrNull(v?: string): number | null {
  if (!v || v.length === 0) return null;
  const n = Number(v);
  if (isNaN(n)) return null;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export function normalizeOpportunityInput(input: OpportunityInput) {
  const outcome = input.outcome && input.outcome.length > 0 ? input.outcome : "OPEN";
  return {
    name: input.name,
    clientId: orNull(input.clientId),
    stageId: orNull(input.stageId),
    ownerId: orNull(input.ownerId),
    valueCents: moneyToCents(input.value),
    probability: probabilityOrNull(input.probability),
    outcome,
    expectedCloseAt: dateOrNull(input.expectedCloseAt),
    closedAt: outcome === "OPEN" ? null : new Date(),
  };
}
