export function formatChangeReference(n: number): string {
  return `CHG-${1000 + n}`;
}

export const CHANGE_RISKS = ["LOW", "MEDIUM", "HIGH"] as const;
export type ChangeRisk = (typeof CHANGE_RISKS)[number];
