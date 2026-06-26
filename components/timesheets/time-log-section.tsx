import Link from "next/link";
import { requireUser } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { isTimesheetingEnabled } from "@/lib/settings/service";
import { listTimeEntries, getRunningTimer } from "@/lib/timesheets/queries";
import { formatMinutes } from "@/lib/timesheets/meta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeEntryStatusBadge } from "@/components/timesheets/badges";
import { TimerWidget, type TimerContext } from "@/components/timesheets/timer-widget";
import { TimeEntryForm } from "@/components/timesheets/time-entry-form";
import { relationLabel } from "@/components/timesheets/entry-context";
import { createTimeEntryAction, submitTimeEntryAction, deleteTimeEntryAction } from "@/app/(app)/timesheets/actions";

interface TimeLogContext {
  ticketId?: string;
  taskId?: string;
  visitId?: string;
  clientId?: string;
  label?: string;
}

// Self-contained: renders nothing when timesheeting is off or the user lacks access.
export async function TimeLogSection({
  context,
  redirectTo,
}: {
  context: TimeLogContext;
  redirectTo: string;
}) {
  const user = await requireUser();
  if (!can(user, "timesheets.read")) return null;
  if (!(await isTimesheetingEnabled())) return null;

  const canReadAll = can(user, "timesheets.read.all");
  const entityFilter = {
    ticketId: context.ticketId,
    taskId: context.taskId,
    visitId: context.visitId,
  };
  const [entries, timer] = await Promise.all([
    listTimeEntries({ ...entityFilter, userId: canReadAll ? undefined : user.id }),
    getRunningTimer(user.id),
  ]);

  const totalMinutes = entries.reduce((sum, e) => sum + e.minutes, 0);
  const timerContext: TimerContext = { ...context };
  const running = timer
    ? { startedAt: new Date(timer.startedAt).toISOString(), label: relationLabel(timer) }
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Time tracking{" "}
            <span className="text-sm font-normal text-[var(--muted-foreground)]">
              ({formatMinutes(totalMinutes)})
            </span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <TimerWidget running={running} redirectTo={redirectTo} context={timerContext} />

        {entries.length > 0 ? (
          <div>
            {entries.map((e) => {
              const isOwn = e.userId === user.id;
              const editable = isOwn && (e.status === "DRAFT" || e.status === "REJECTED");
              return (
                <div key={e.id} className="flex items-center justify-between gap-3 border-b border-[var(--border)] py-2 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium whitespace-nowrap">{formatMinutes(e.minutes)}</span>
                    <span className="text-[var(--muted-foreground)] truncate">
                      {e.user.firstName} {e.user.lastName}
                      {e.description ? ` — ${e.description}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {e.billable ? <span className="text-xs text-[#10b981]">billable</span> : null}
                    <TimeEntryStatusBadge status={e.status} />
                    {editable ? (
                      <>
                        <Link
                          href={`/timesheets/${e.id}/edit?from=${encodeURIComponent(redirectTo)}`}
                          className="text-xs hover:underline"
                        >
                          Edit
                        </Link>
                        <form action={submitTimeEntryAction}>
                          <input type="hidden" name="id" value={e.id} />
                          <input type="hidden" name="redirectTo" value={redirectTo} />
                          <button type="submit" className="text-xs text-[var(--primary)] hover:underline">Submit</button>
                        </form>
                        <form action={deleteTimeEntryAction}>
                          <input type="hidden" name="id" value={e.id} />
                          <input type="hidden" name="redirectTo" value={redirectTo} />
                          <button type="submit" className="text-xs text-[var(--destructive)] hover:underline">Delete</button>
                        </form>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        <details className="rounded-[var(--radius)] border border-[var(--border)] p-3">
          <summary className="cursor-pointer text-sm font-medium">Log time manually</summary>
          <div className="pt-3">
            <TimeEntryForm
              action={createTimeEntryAction}
              submitLabel="Log time"
              redirectTo={redirectTo}
              context={context}
              compact
            />
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
