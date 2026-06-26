import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isTimesheetingEnabled } from "@/lib/settings/service";
import { listTimeEntries } from "@/lib/timesheets/queries";
import { formatMinutes, formatRateCents } from "@/lib/timesheets/meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { EntryContext } from "@/components/timesheets/entry-context";
import { approveTimeEntryAction, rejectTimeEntryAction } from "../actions";

export default async function ApprovalsPage() {
  await requirePermission("timesheets.approve");
  if (!(await isTimesheetingEnabled())) notFound();
  const pending = await listTimeEntries({ status: "SUBMITTED" });

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Timesheets", href: "/timesheets" }, { label: "Approvals" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">Timesheet approvals</h1>

      <Card>
        {pending.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">Nothing waiting for approval.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Date</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">User</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Duration</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Context</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Rate</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Decision</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((e) => (
                <tr key={e.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/40">
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] whitespace-nowrap">{e.user.firstName} {e.user.lastName}</td>
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <form action={approveTimeEntryAction}>
                        <input type="hidden" name="id" value={e.id} />
                        <Button type="submit" variant="outline" className="px-3 py-1 text-xs">Approve</Button>
                      </form>
                      <form action={rejectTimeEntryAction}>
                        <input type="hidden" name="id" value={e.id} />
                        <Button type="submit" variant="outline" className="px-3 py-1 text-xs text-[var(--destructive)]">Reject</Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
