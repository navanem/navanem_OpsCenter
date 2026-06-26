export function formatSubscriptionReference(n: number): string {
  return `SUB-${1000 + n}`;
}

// True when a renewal date falls within the next `days` (and hasn't already passed).
export function isRenewalDueSoon(
  renewalDate: Date | string | null | undefined,
  now: Date = new Date(),
  days = 30,
): boolean {
  if (!renewalDate) return false;
  const end = new Date(renewalDate).getTime();
  const horizon = now.getTime() + days * 24 * 60 * 60 * 1000;
  return end >= now.getTime() && end <= horizon;
}

export function isRenewalOverdue(
  renewalDate: Date | string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!renewalDate) return false;
  return new Date(renewalDate).getTime() < now.getTime();
}
