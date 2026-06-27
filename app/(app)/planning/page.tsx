import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { listVisitsInRange } from "@/lib/planning/queries";
import { listVisitTypes } from "@/lib/taxonomies/queries";
import { listTechnicians } from "@/lib/users/queries";
import { getLocale, getDictionary } from "@/lib/i18n/server";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PlanningFilters } from "./planning-filters";

type SP = { month?: string; assigneeId?: string; typeId?: string };

const TIME_FMT: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hour12: false };

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Monday on or before the given date.
function mondayOf(d: Date): Date {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = m.getDay(); // 0=Sun..6=Sat
  m.setDate(m.getDate() + (day === 0 ? -6 : 1 - day));
  return m;
}

export default async function PlanningPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePermission("visits.read");
  const [sp, locale, dict] = await Promise.all([searchParams, getLocale(), getDictionary()]);
  const tag = locale === "fr" ? "fr-FR" : "en-US";

  const now = new Date();
  const parsed = sp.month && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month.split("-").map(Number) : null;
  const monthStart = parsed ? new Date(parsed[0], parsed[1] - 1, 1) : new Date(now.getFullYear(), now.getMonth(), 1);
  const monthKey = `${monthStart.getFullYear()}-${`${monthStart.getMonth() + 1}`.padStart(2, "0")}`;

  // 6-week grid starting on the Monday on/before the 1st.
  const gridStart = mondayOf(monthStart);
  const gridEnd = new Date(gridStart);
  gridEnd.setDate(gridEnd.getDate() + 42);

  const [visits, technicians, types] = await Promise.all([
    listVisitsInRange({
      from: gridStart,
      to: gridEnd,
      assigneeId: sp.assigneeId || undefined,
      typeId: sp.typeId || undefined,
    }),
    listTechnicians(),
    listVisitTypes({ activeOnly: true }),
  ]);

  const cells = Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(date.getDate() + i);
    const dayVisits = visits
      .filter((v) => sameDay(new Date(v.scheduledAt), date))
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    return {
      date,
      inMonth: date.getMonth() === monthStart.getMonth(),
      isToday: sameDay(date, now),
      visits: dayVisits,
    };
  });

  const weekdayLabels = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(tag, { weekday: "short" }).format(cells[i].date),
  );
  const monthTitle = new Intl.DateTimeFormat(tag, { month: "long", year: "numeric" }).format(monthStart);
  const canManage = can(user, "visits.manage");
  const MAX_CHIPS = 3;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.planning }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{dict.nav.planning}</h1>
        {canManage ? (
          <div className="flex gap-2">
            <Link href="/planning/recurring"><Button variant="outline">{dict.planning.recurring}</Button></Link>
            <Link href="/planning/visits/new"><Button>{dict.planning.new}</Button></Link>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold capitalize tracking-tight">{monthTitle}</h2>
        <PlanningFilters month={monthKey} technicians={technicians} types={types.map((t) => ({ id: t.id, name: t.name }))} />
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)]">
        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--muted)]/40">
          {weekdayLabels.map((d) => (
            <div key={d} className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {d}
            </div>
          ))}
        </div>
        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((cell, i) => {
            const extra = cell.visits.length - MAX_CHIPS;
            return (
              <div
                key={i}
                className={
                  "min-h-[7rem] border-b border-r border-[var(--border)] p-1.5 [&:nth-child(7n)]:border-r-0 " +
                  (i >= 35 ? "border-b-0 " : "") +
                  (cell.inMonth ? "" : "bg-[var(--muted)]/20 ")
                }
              >
                <div className="mb-1 flex justify-end">
                  <span
                    className={
                      "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs " +
                      (cell.isToday
                        ? "bg-[var(--primary)] font-semibold text-[var(--primary-foreground)]"
                        : cell.inMonth
                          ? "text-[var(--foreground)]"
                          : "text-[var(--muted-foreground)]")
                    }
                  >
                    {cell.date.getDate()}
                  </span>
                </div>
                <div className="space-y-1">
                  {cell.visits.slice(0, MAX_CHIPS).map((v) => {
                    const color = v.type.color ?? "#6b7280";
                    const cancelled = v.status === "CANCELLED";
                    return (
                      <Link
                        key={v.id}
                        href={`/planning/visits/${v.id}/edit`}
                        title={`${new Date(v.scheduledAt).toLocaleTimeString(tag, TIME_FMT)} · ${v.title}${v.client ? ` · ${v.client.companyName}` : ""}`}
                        className={
                          "block truncate rounded-[var(--radius-sm)] px-1.5 py-0.5 text-xs font-medium text-white transition-opacity hover:opacity-90 " +
                          (cancelled ? "line-through opacity-50" : "")
                        }
                        style={{ backgroundColor: color }}
                      >
                        <span className="tabular-nums opacity-90">{new Date(v.scheduledAt).toLocaleTimeString(tag, TIME_FMT)}</span>{" "}
                        {v.title}
                      </Link>
                    );
                  })}
                  {extra > 0 ? (
                    <div className="px-1 text-[11px] font-medium text-[var(--muted-foreground)]">+{extra} more</div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
