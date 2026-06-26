import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isTimesheetingEnabled } from "@/lib/settings/service";
import { getTimeEntry } from "@/lib/timesheets/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TimeEntryForm } from "@/components/timesheets/time-entry-form";
import { relationLabel } from "@/components/timesheets/entry-context";
import { updateTimeEntryAction, submitTimeEntryAction, deleteTimeEntryAction } from "../../actions";

export default async function EditTimeEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const user = await requirePermission("timesheets.read");
  if (!(await isTimesheetingEnabled())) notFound();
  const { id } = await params;
  const { from } = await searchParams;
  const redirectTo = from && from.startsWith("/") ? from : "/timesheets";
  const entry = await getTimeEntry(id);
  if (!entry || entry.userId !== user.id) notFound();

  const editable = entry.status === "DRAFT" || entry.status === "REJECTED";
  const p = (n: number) => `${n}`.padStart(2, "0");
  const dateStr = `${new Date(entry.date).getFullYear()}-${p(new Date(entry.date).getMonth() + 1)}-${p(new Date(entry.date).getDate())}`;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Timesheets", href: "/timesheets" }, { label: "Edit entry" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">Edit time entry</h1>

      {!editable ? (
        <Card>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)]">
              This entry is {entry.status.toLowerCase()} and can no longer be edited.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{relationLabel(entry)}</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeEntryForm
              action={updateTimeEntryAction}
              submitLabel="Save changes"
              redirectTo={redirectTo}
              defaults={{
                id: entry.id,
                date: dateStr,
                hours: Math.floor(entry.minutes / 60),
                minutes: entry.minutes % 60,
                description: entry.description,
                billable: entry.billable,
                hourlyRate: entry.hourlyRateCents != null ? (entry.hourlyRateCents / 100).toFixed(2) : "",
              }}
              context={{
                ticketId: entry.ticketId ?? undefined,
                taskId: entry.taskId ?? undefined,
                visitId: entry.visitId ?? undefined,
                clientId: entry.clientId ?? undefined,
                label: `Linked to: ${relationLabel(entry)}`,
              }}
            />
          </CardContent>
        </Card>
      )}

      {editable ? (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <form action={submitTimeEntryAction}>
              <input type="hidden" name="id" value={entry.id} />
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <Button type="submit">Submit for approval</Button>
            </form>
            <form action={deleteTimeEntryAction}>
              <input type="hidden" name="id" value={entry.id} />
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <Button type="submit" variant="destructive">Delete</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
