import { TICKET_STATUS_META } from "@/lib/tickets/meta";

// `label` overrides the (English) default status label so callers can pass a translated one.
export function StatusBadge({ status, label }: { status: keyof typeof TICKET_STATUS_META; label?: string }) {
  const m = TICKET_STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${m.color}22`, color: m.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
      {label ?? m.label}
    </span>
  );
}

export function PriorityBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {name}
    </span>
  );
}

export function CategoryBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {name}
    </span>
  );
}
