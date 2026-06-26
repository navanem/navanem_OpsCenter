import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { listVisitsInRange } from "@/lib/planning/queries";
import { listVisitTypes } from "@/lib/taxonomies/queries";
import { listTechnicians } from "@/lib/users/queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { VisitStatusBadge, TypeDot } from "@/components/planning/badges";
import { PlanningFilters } from "./planning-filters";

type SP = { week?: string; assigneeId?: string; typeId?: string };

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Snap any date to the Monday 00:00 of its week (Mon–Sun layout).
function mondayOf(d: Date): Date {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  const day = m.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day; // back to Monday
  m.setDate(m.getDate() + diff);
  return m;
}

const TIME_FMT: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hour12: false };
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default async function PlanningPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePermission("visits.read");
  const sp = await searchParams;

  const base = sp.week ? new Date(sp.week + "T00:00:00") : new Date();
  const monday = mondayOf(isNaN(base.getTime()) ? new Date() : base);
  const from = new Date(monday);
  const to = new Date(monday);
  to.setDate(to.getDate() + 7);

  const [visits, technicians, types] = await Promise.all([
    listVisitsInRange({
      from,
      to,
      assigneeId: sp.assigneeId || undefined,
      typeId: sp.typeId || undefined,
    }),
    listTechnicians(),
    listVisitTypes({ activeOnly: true }),
  ]);

  // One column per day Mon–Sun.
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const dayVisits = visits
      .filter((v) => {
        const s = new Date(v.scheduledAt);
        return s.getFullYear() === d.getFullYear() && s.getMonth() === d.getMonth() && s.getDate() === d.getDate();
      })
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    return { date: d, label: DAY_LABELS[i], visits: dayVisits };
  });

  const canManage = can(user, "visits.manage");

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Planning" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Planning</h1>
        {canManage ? (
          <div className="flex gap-2">
            <Link href="/planning/recurring">
              <Button variant="outline">Recurring visits</Button>
            </Link>
            <Link href="/planning/visits/new">
              <Button>New visit</Button>
            </Link>
          </div>
        ) : null}
      </div>

      <PlanningFilters
        monday={isoDate(monday)}
        technicians={technicians}
        types={types.map((t) => ({ id: t.id, name: t.name }))}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
        {days.map((day) => (
          <div key={day.label} className="space-y-2">
            <div className="flex items-baseline justify-between border-b border-[var(--border)] pb-2">
              <span className="text-sm font-medium">{day.label}</span>
              <span className="text-xs text-[var(--muted-foreground)]">
                {day.date.getDate()}/{day.date.getMonth() + 1}
              </span>
            </div>
            {day.visits.length === 0 ? (
              <p className="px-1 py-2 text-xs text-[var(--muted-foreground)]">—</p>
            ) : (
              day.visits.map((v) => (
                <Card
                  key={v.id}
                  className={`p-3 ${v.status === "CANCELLED" ? "opacity-50" : ""}`}
                >
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-[var(--muted-foreground)]">
                      {new Date(v.scheduledAt).toLocaleTimeString([], TIME_FMT)}
                    </div>
                    <Link
                      href={`/planning/visits/${v.id}/edit`}
                      className="flex items-center gap-1.5 text-sm font-medium hover:underline"
                    >
                      <TypeDot color={v.type.color ?? "#6b7280"} />
                      <span className="truncate">{v.title}</span>
                    </Link>
                    {v.client ? (
                      <div className="truncate text-xs text-[var(--muted-foreground)]">
                        {v.client.companyName}
                      </div>
                    ) : null}
                    <div className="truncate text-xs text-[var(--muted-foreground)]">
                      {v.assignee ? `${v.assignee.firstName} ${v.assignee.lastName}` : "Unassigned"}
                    </div>
                    <VisitStatusBadge status={v.status} />
                  </div>
                </Card>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
