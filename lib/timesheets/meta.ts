export const TIME_ENTRY_STATUS_META = {
  DRAFT: { label: "Draft", color: "#6b7280" },
  SUBMITTED: { label: "Submitted", color: "#3b82f6" },
  APPROVED: { label: "Approved", color: "#10b981" },
  REJECTED: { label: "Rejected", color: "#ef4444" },
} as const;
export type TimeEntryStatusKey = keyof typeof TIME_ENTRY_STATUS_META;
export const TIME_ENTRY_STATUSES = Object.keys(TIME_ENTRY_STATUS_META) as TimeEntryStatusKey[];

export function formatMinutes(total: number): string {
  const m = Math.max(0, Math.floor(total));
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h === 0) return `${mm}m`;
  if (mm === 0) return `${h}h`;
  return `${h}h ${mm}m`;
}

export function formatRateCents(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return (cents / 100).toFixed(2);
}
