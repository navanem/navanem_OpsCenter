export const TICKET_STATUS_META = {
  OPEN: { label: "Open", color: "#3b82f6" },
  IN_PROGRESS: { label: "In progress", color: "#8b5cf6" },
  PENDING: { label: "Pending", color: "#f59e0b" },
  RESOLVED: { label: "Resolved", color: "#10b981" },
  CLOSED: { label: "Closed", color: "#6b7280" },
} as const;

export type TicketStatusKey = keyof typeof TICKET_STATUS_META;
export const TICKET_STATUSES = Object.keys(TICKET_STATUS_META) as TicketStatusKey[];

export function formatTicketReference(n: number): string {
  return `TKT-${1000 + n}`;
}
