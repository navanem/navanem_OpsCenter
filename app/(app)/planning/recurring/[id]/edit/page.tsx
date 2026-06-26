import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { getRecurringVisit } from "@/lib/planning/queries";
import { listVisitTypes } from "@/lib/taxonomies/queries";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { RecurringForm } from "../../recurring-form";
import { updateRecurringVisitAction, deleteRecurringVisitAction } from "../../../actions";

export default async function EditRecurringVisitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("visits.manage");
  const { id } = await params;

  const [rv, types, clients, technicians] = await Promise.all([
    getRecurringVisit(id),
    listVisitTypes({ activeOnly: true }),
    listClients({}),
    listTechnicians(),
  ]);

  if (!rv) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Planning", href: "/planning" },
          { label: "Recurring visits", href: "/planning/recurring" },
          { label: rv.title },
        ]}
      />
      <h1 className="text-2xl font-semibold tracking-tight">Edit recurring visit</h1>
      <Card>
        <CardHeader>
          <CardTitle>{rv.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <RecurringForm
            action={updateRecurringVisitAction}
            types={types}
            clients={clients}
            technicians={technicians}
            defaults={{
              id: rv.id,
              title: rv.title,
              description: rv.description,
              typeId: rv.typeId,
              clientId: rv.clientId,
              assigneeId: rv.assigneeId,
              location: rv.location,
              durationMinutes: rv.durationMinutes,
              frequency: rv.frequency,
              interval: rv.interval,
              weekdays: rv.weekdays,
              startDate: rv.startDate,
              endDate: rv.endDate,
              timeHour: rv.timeHour,
              timeMinute: rv.timeMinute,
            }}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-[var(--muted-foreground)]">
            Deleting this series removes its future scheduled occurrences. Past and completed visits are kept.
          </p>
          <form action={deleteRecurringVisitAction}>
            <input type="hidden" name="id" value={rv.id} />
            <Button type="submit" variant="destructive">Delete recurring visit</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
