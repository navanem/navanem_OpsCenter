import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isTimesheetingEnabled } from "@/lib/settings/service";
import { listClients } from "@/lib/clients/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TimeEntryForm } from "@/components/timesheets/time-entry-form";
import { createTimeEntryAction } from "../actions";

export default async function NewTimeEntryPage() {
  await requirePermission("timesheets.read");
  if (!(await isTimesheetingEnabled())) notFound();
  const clients = await listClients({});

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Timesheets", href: "/timesheets" }, { label: "New entry" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">New time entry</h1>
      <Card>
        <CardHeader>
          <CardTitle>New time entry</CardTitle>
        </CardHeader>
        <CardContent>
          <TimeEntryForm
            action={createTimeEntryAction}
            submitLabel="Save entry"
            redirectTo="/timesheets"
            clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
