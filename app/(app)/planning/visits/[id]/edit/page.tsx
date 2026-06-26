import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { getVisit } from "@/lib/planning/queries";
import { listVisitTypes } from "@/lib/taxonomies/queries";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TimeLogSection } from "@/components/timesheets/time-log-section";
import { VisitForm } from "../../../visit-form";
import {
  updateVisitAction,
  setVisitStatusAction,
  deleteVisitAction,
} from "../../../actions";

export default async function EditVisitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("visits.manage");
  const { id } = await params;

  const [visit, types, clients, technicians] = await Promise.all([
    getVisit(id),
    listVisitTypes({ activeOnly: true }),
    listClients({}),
    listTechnicians(),
  ]);

  if (!visit) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Planning", href: "/planning" }, { label: visit.title }]} />
      <h1 className="text-2xl font-semibold tracking-tight">Edit visit</h1>
      <Card>
        <CardHeader>
          <CardTitle>{visit.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <VisitForm
            action={updateVisitAction}
            types={types}
            clients={clients}
            technicians={technicians}
            defaults={{
              id: visit.id,
              title: visit.title,
              description: visit.description,
              typeId: visit.typeId,
              clientId: visit.clientId,
              assigneeId: visit.assigneeId,
              location: visit.location,
              scheduledAt: visit.scheduledAt,
              durationMinutes: visit.durationMinutes,
              status: visit.status,
              notes: visit.notes,
            }}
            submitLabel="Save changes"
            showStatus
          />
        </CardContent>
      </Card>

      {visit.status === "SCHEDULED" ? (
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <form action={setVisitStatusAction}>
              <input type="hidden" name="id" value={visit.id} />
              <input type="hidden" name="status" value="COMPLETED" />
              <Button type="submit" variant="outline">Mark completed</Button>
            </form>
            <form action={setVisitStatusAction}>
              <input type="hidden" name="id" value={visit.id} />
              <input type="hidden" name="status" value="CANCELLED" />
              <Button type="submit" variant="outline">Cancel visit</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={deleteVisitAction}>
            <input type="hidden" name="id" value={visit.id} />
            <Button type="submit" variant="destructive">Delete visit</Button>
          </form>
        </CardContent>
      </Card>

      <TimeLogSection
        context={{ visitId: visit.id, label: `Linked to visit "${visit.title}"` }}
        redirectTo={`/planning/visits/${visit.id}/edit`}
      />
    </div>
  );
}
