export const TICKET_STATUS_META = {
  OPEN: { label: "Open", color: "#3b82f6" },
  IN_PROGRESS: { label: "In progress", color: "#8b5cf6" },
  PENDING: { label: "Pending", color: "#f59e0b" },
  RESOLVED: { label: "Resolved", color: "#10b981" },
  CLOSED: { label: "Closed", color: "#6b7280" },
} as const;

export type TicketStatusKey = keyof typeof TICKET_STATUS_META;
export const TICKET_STATUSES = Object.keys(TICKET_STATUS_META) as TicketStatusKey[];

export const TICKET_PRIORITY_META = {
  LOW: { label: "Low", color: "#6b7280" },
  MEDIUM: { label: "Medium", color: "#3b82f6" },
  HIGH: { label: "High", color: "#f59e0b" },
  URGENT: { label: "Urgent", color: "#ef4444" },
} as const;

export type TicketPriorityKey = keyof typeof TICKET_PRIORITY_META;
export const TICKET_PRIORITIES = Object.keys(TICKET_PRIORITY_META) as TicketPriorityKey[];

export const TICKET_CATEGORY_META = {
  HARDWARE: { label: "Hardware" },
  SOFTWARE: { label: "Software" },
  NETWORK: { label: "Network" },
  ACCOUNT: { label: "Account" },
  OTHER: { label: "Other" },
} as const;

export type TicketCategoryKey = keyof typeof TICKET_CATEGORY_META;
export const TICKET_CATEGORIES = Object.keys(TICKET_CATEGORY_META) as TicketCategoryKey[];

export function formatTicketReference(n: number): string {
  return `TKT-${1000 + n}`;
}
