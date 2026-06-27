export function formatProblemReference(n: number): string {
  return `PRB-${1000 + n}`;
}

export const PROBLEM_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type ProblemPriority = (typeof PROBLEM_PRIORITIES)[number];
