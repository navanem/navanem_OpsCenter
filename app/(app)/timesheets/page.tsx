import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { isTimesheetingEnabled } from "@/lib/settings/service";
import { listTimeEntries, getTimeStats, getRunningTimer } from "@/lib/timesheets/queries";
import { formatMinutes, formatRateCents } from "@/lib/timesheets/meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TimeEntryStatusBadge } from "@/components/timesheets/badges";
import { TimerWidget } from "@/components/timesheets/timer-widget";
import { EntryContext, relationLabel } from "@/components/timesheets/entry-context";
import { getDictionary } from "@/lib/i18n/server";
import { submitTimeEntryAction, deleteTimeEntryAction } from "./actions";

type SP = { status?: string; scope?: string };
const STATUSES = ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"] as const;

export default async function TimesheetsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePermission("timesheets.read");
  if (!(await isTimesheetingEnabled())) notFound();
  const [sp, dict] = await Promise.all([searchParams, getDictionary()]);

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
    { label: dict.timesheets.kpiTotalTime, value: formatMinutes(stats.totalMinutes), color: "#6d5efc" },
    { label: dict.timesheets.kpiBillableTime, value: formatMinutes(stats.billableMinutes), color: "#10b981" },
    { label: dict.timesheets.kpiSubmitted, value: stats.submitted, color: "#3b82f6" },
    { label: dict.timesheets.kpiApproved, value: stats.approved, color: "#22c55e" },
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
      <Breadcrumbs items={[{ label: dict.nav.timesheets }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{dict.nav.timesheets}</h1>
        <div className="flex gap-2">
          {canViewAll ? (
            <a href="/api/export?type=timesheets" download><Button variant="outline">{dict.common.exportCsv}</Button></a>
          ) : null}
          {canViewAll ? (
            <Link href="/timesheets/reports"><Button variant="outline">{dict.timesheets.reports}</Button></Link>
          ) : null}
          {canApprove ? (
            <Link href="/timesheets/approvals"><Button variant="outline">{dict.timesheets.approvals}</Button></Link>
          ) : null}
          <Link href="/timesheets/new"><Button>{dict.timesheets.newEntry}</Button></Link>
        </div>
      </div>

      <TimerWidget running={running} redirectTo="/timesheets" />

      <StatGrid>
        {kpis.map((k) => (
          <StatCard key={k.label} label={k.label} value={k.value} color={k.color} />
        ))}
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link href={baseQuery({ status: undefined })} className={`rounded-full px-3 py-1 ${!status ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)]"}`}>{dict.common.all}</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={baseQuery({ status: s })} className={`rounded-full px-3 py-1 ${status === s ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)]"}`}>
            {dict.timesheetStatus[s]}
          </Link>
        ))}
        {canViewAll ? (
          <span className="ml-auto flex items-center gap-2">
            <Link href={baseQuery({ scope: undefined })} className={`rounded-full px-3 py-1 ${!viewingAll ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)]"}`}>{dict.timesheets.mine}</Link>
            <Link href={baseQuery({ scope: "all" })} className={`rounded-full px-3 py-1 ${viewingAll ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)]"}`}>{dict.timesheets.everyone}</Link>
          </span>
        ) : null}
      </div>

      <Card>
        {entries.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">{dict.timesheets.noneFound}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.date}</th>
                {viewingAll ? <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.user}</th> : null}
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.timesheets.colDuration}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.timesheets.colContext}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.timesheets.colRate}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.status}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.actions}</th>
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
                      {e.billable ? <span className="ml-1.5 text-xs text-[#10b981]">{dict.timesheets.billable}</span> : null}
                    </td>
                    <td className="px-4 py-3 min-w-0">
                      <div className="truncate">
                        <EntryContext entry={e} />
                        {e.description ? <span className="text-[var(--muted-foreground)]"> — {e.description}</span> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)] whitespace-nowrap">{formatRateCents(e.hourlyRateCents)}</td>
                    <td className="px-4 py-3"><TimeEntryStatusBadge status={e.status} label={dict.timesheetStatus[e.status as keyof typeof dict.timesheetStatus]} /></td>
                    <td className="px-4 py-3">
                      {editable ? (
                        <div className="flex items-center gap-2">
                          <Link href={`/timesheets/${e.id}/edit`} className="text-xs hover:underline">{dict.common.edit}</Link>
                          <form action={submitTimeEntryAction}>
                            <input type="hidden" name="id" value={e.id} />
                            <input type="hidden" name="redirectTo" value="/timesheets" />
                            <button type="submit" className="text-xs text-[var(--primary)] hover:underline">{dict.timesheets.submit}</button>
                          </form>
                          <form action={deleteTimeEntryAction}>
                            <input type="hidden" name="id" value={e.id} />
                            <input type="hidden" name="redirectTo" value="/timesheets" />
                            <button type="submit" className="text-xs text-[var(--destructive)] hover:underline">{dict.common.delete}</button>
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
