export function formatDeviceReference(n: number): string {
  return `DEV-${1000 + n}`;
}

// True when a warranty date falls within the next `days` (and hasn't already passed long ago handled by caller).
export function isWarrantyExpiringSoon(
  warrantyExpiry: Date | string | null | undefined,
  now: Date = new Date(),
  days = 60,
): boolean {
  if (!warrantyExpiry) return false;
  const end = new Date(warrantyExpiry).getTime();
  const horizon = now.getTime() + days * 24 * 60 * 60 * 1000;
  return end >= now.getTime() && end <= horizon;
}

export function isWarrantyExpired(
  warrantyExpiry: Date | string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!warrantyExpiry) return false;
  return new Date(warrantyExpiry).getTime() < now.getTime();
}
