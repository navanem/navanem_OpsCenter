export const TASK_PRIORITY_META = {
  LOW: { label: "Low", color: "#6b7280" },
  MEDIUM: { label: "Medium", color: "#3b82f6" },
  HIGH: { label: "High", color: "#f59e0b" },
} as const;
export type TaskPriorityKey = keyof typeof TASK_PRIORITY_META;
export const TASK_PRIORITIES = Object.keys(TASK_PRIORITY_META) as TaskPriorityKey[];

export function formatProjectReference(n: number): string {
  return `PRJ-${1000 + n}`;
}
