import { TICKET_STATUS_META, TICKET_PRIORITY_META } from "@/lib/tickets/meta";

export function StatusBadge({ status }: { status: keyof typeof TICKET_STATUS_META }) {
  const m = TICKET_STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${m.color}22`, color: m.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
      {m.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: keyof typeof TICKET_PRIORITY_META }) {
  const m = TICKET_PRIORITY_META[priority];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${m.color}22`, color: m.color }}
    >
      {m.label}
    </span>
  );
}
