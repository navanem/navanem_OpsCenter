export const BILLING_CYCLES = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "YEARLY", label: "Yearly" },
  { value: "ONE_OFF", label: "One-off" },
] as const;
export type BillingCycleKey = (typeof BILLING_CYCLES)[number]["value"];

export function billingCycleLabel(cycle: string): string {
  return BILLING_CYCLES.find((c) => c.value === cycle)?.label ?? cycle;
}

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

// Normalise a contract value to its monthly recurring equivalent (for MRR-style stats).
export function monthlyEquivalentCents(valueCents: number | null, cycle: BillingCycleKey): number {
  if (valueCents == null) return 0;
  switch (cycle) {
    case "MONTHLY":
      return valueCents;
    case "QUARTERLY":
      return Math.round(valueCents / 3);
    case "YEARLY":
      return Math.round(valueCents / 12);
    case "ONE_OFF":
      return 0;
  }
}

export function formatContractReference(n: number): string {
  return `CON-${1000 + n}`;
}
