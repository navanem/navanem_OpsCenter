export function formatLeadReference(n: number): string {
  return `LEAD-${1000 + n}`;
}

export function formatOpportunityReference(n: number): string {
  return `OPP-${1000 + n}`;
}

export const OPPORTUNITY_OUTCOMES = ["OPEN", "WON", "LOST"] as const;
export type OpportunityOutcome = (typeof OPPORTUNITY_OUTCOMES)[number];

export function formatMoneyCents(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return (cents / 100).toFixed(2);
}

export function moneyToCents(v?: string): number | null {
  if (!v || v.trim().length === 0) return null;
  const n = Number(v.replace(/\s/g, "").replace(",", "."));
  if (isNaN(n) || n < 0) return null;
  return Math.round(n * 100);
}
