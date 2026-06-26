export const VISIT_STATUS_META = {
  SCHEDULED: { label: "Scheduled", color: "#3b82f6" },
  COMPLETED: { label: "Completed", color: "#10b981" },
  CANCELLED: { label: "Cancelled", color: "#6b7280" },
} as const;
export type VisitStatusKey = keyof typeof VISIT_STATUS_META;
export const VISIT_STATUSES = Object.keys(VISIT_STATUS_META) as VisitStatusKey[];

export const WEEKDAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export const FREQUENCIES = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
] as const;
