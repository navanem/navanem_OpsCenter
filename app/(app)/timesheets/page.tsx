import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { isTimesheetingEnabled } from "@/lib/settings/service";
import { listTimeEntries, getTimeStats, getRunningTimer } from "@/lib/timesheets/queries";
import { formatMinutes, formatRateCents } from "@/lib/timesheets/meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TimeEntryStatusBadge } from "@/components/timesheets/badges";
import { TimerWidget } from "@/components/timesheets/timer-widget";
import { EntryContext, relationLabel } from "@/components/timesheets/entry-context";
import { submitTimeEntryAction, deleteTimeEntryAction } from "./actions";

type SP = { status?: string; scope?: string };
const STATUSES = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"] as const;

export default async function TimesheetsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePermission("timesheets.read");
  if (!(await isTimesheetingEnabled())) notFound();
  const sp = await searchParams;

  const canViewAll = can(user, "timesheets.read.all");
  const canApprove = can(user, "timesheets.approve");
  const viewingAll = canViewAll && sp.scope === "all";
  const status = STATUSES.includes(sp.status as never) ? (sp.status as (typeof STATUSES)[number]) : undefined;
  const scopeUserId = viewingAll ? undefined : user.id;

  const [entries, stats, timer] = await Promise.all([
    listTimeEntries({ userId: scopeUserId, status }),
    getTimeStats({ userId: scopeUserId }),
    getRunningTimer(user.id),
  ]);

  const kpis = [
    { label: "Total time", value: formatMinutes(stats.totalMinutes), color: "#6d5efc" },
    { label: "Billable time", value: formatMinutes(stats.billableMinutes), color: "#10b981" },
    { label: "Submitted", value: stats.submitted, color: "#3b82f6" },
    { label: "Approved", value: stats.approved, color: "#22c55e" },
  ];

  const running = timer
    ? { startedAt: new Date(timer.startedAt).toISOString(), label: relationLabel(timer) }
    : null;

  const baseQuery = (next: Partial<SP>) => {
    const params = new URLSearchParams();
    const merged = { status: sp.status, scope: sp.scope, ...next };
    if (merged.status) params.set("status", merged.status);
    if (merged.scope) params.set("scope", merged.scope);
    const qs = params.toString();
    return `/timesheets${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Timesheets" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Timesheets</h1>
        <div className="flex gap-2">
          {canApprove ? (
            <Link href="/timesheets/approvals"><Button variant="outline">Approvals</Button></Link>
          ) : null}
          <Link href="/timesheets/new"><Button>New entry</Button></Link>
        </div>
      </div>

      <TimerWidget running={running} redirectTo="/timesheets" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="relative overflow-hidden">
            <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: k.color }} />
            <CardContent>
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">{k.label}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link href={baseQuery({ status: undefined })} className={`rounded-full px-3 py-1 ${!status ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)]"}`}>All</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={baseQuery({ status: s })} className={`rounded-full px-3 py-1 ${status === s ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)]"}`}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </Link>
        ))}
        {canViewAll ? (
          <span className="ml-auto flex items-center gap-2">
            <Link href={baseQuery({ scope: undefined })} className={`rounded-full px-3 py-1 ${!viewingAll ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)]"}`}>Mine</Link>
            <Link href={baseQuery({ scope: "all" })} className={`rounded-full px-3 py-1 ${viewingAll ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)]"}`}>Everyone</Link>
          </span>
        ) : null}
      </div>

      <Card>
        {entries.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">No time entries.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Date</th>
                {viewingAll ? <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">User</th> : null}
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Duration</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Context</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Rate</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Status</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const isOwn = e.userId === user.id;
                const editable = isOwn && (e.status === "DRAFT" || e.status === "REJECTED");
                return (
                  <tr key={e.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/40">
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(e.date).toLocaleDateString()}</td>
                    {viewingAll ? (
                      <td className="px-4 py-3 text-[var(--muted-foreground)] whitespace-nowrap">{e.user.firstName} {e.user.lastName}</td>
                    ) : null}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatMinutes(e.minutes)}
                      {e.billable ? <span className="ml-1.5 text-xs text-[#10b981]">billable</span> : null}
                    </td>
                    <td className="px-4 py-3 min-w-0">
                      <div className="truncate">
                        <EntryContext entry={e} />
                        {e.description ? <span className="text-[var(--muted-foreground)]"> — {e.description}</span> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)] whitespace-nowrap">{formatRateCents(e.hourlyRateCents)}</td>
                    <td className="px-4 py-3"><TimeEntryStatusBadge status={e.status} /></td>
                    <td className="px-4 py-3">
                      {editable ? (
                        <div className="flex items-center gap-2">
                          <Link href={`/timesheets/${e.id}/edit`} className="text-xs hover:underline">Edit</Link>
                          <form action={submitTimeEntryAction}>
                            <input type="hidden" name="id" value={e.id} />
                            <input type="hidden" name="redirectTo" value="/timesheets" />
                            <button type="submit" className="text-xs text-[var(--primary)] hover:underline">Submit</button>
                          </form>
                          <form action={deleteTimeEntryAction}>
                            <input type="hidden" name="id" value={e.id} />
                            <input type="hidden" name="redirectTo" value="/timesheets" />
                            <button type="submit" className="text-xs text-[var(--destructive)] hover:underline">Delete</button>
                          </form>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--muted-foreground)]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
