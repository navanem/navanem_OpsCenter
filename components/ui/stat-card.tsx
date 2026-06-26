import type { ReactNode } from "react";

export interface Stat {
  label: string;
  value: ReactNode;
  color?: string;
  hint?: string;
}

export function StatCard({ label, value, color = "#6d5efc", hint }: Stat) {
  return (
    <div className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow)] transition-colors hover:border-[var(--ring)]/40">
      {/* Soft corner glow tinted by the metric color */}
      <span
        className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-30"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">{label}</p>
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      </div>
      <p className="mt-3 text-3xl font-semibold leading-none tracking-tight tabular-nums">{value}</p>
      {hint ? <p className="mt-2 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
      <span className="mt-4 block h-1 w-9 rounded-full" style={{ backgroundColor: color }} aria-hidden />
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}
