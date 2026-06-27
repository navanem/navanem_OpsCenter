import { TIME_ENTRY_STATUS_META } from "@/lib/timesheets/meta";

export function TimeEntryStatusBadge({ status, label }: { status: keyof typeof TIME_ENTRY_STATUS_META; label?: string }) {
  const m = TIME_ENTRY_STATUS_META[status];
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
