import { requirePermission } from "@/lib/auth/guard";
import { listVisitTypes } from "@/lib/taxonomies/queries";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { VisitForm } from "../../visit-form";
import { createVisitAction } from "../../actions";

export default async function NewVisitPage() {
  await requirePermission("visits.manage");
  const [types, clients, technicians] = await Promise.all([
    listVisitTypes({ activeOnly: true }),
    listClients({}),
    listTechnicians(),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Planning", href: "/planning" }, { label: "New visit" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">New visit</h1>
      <Card>
        <CardHeader>
          <CardTitle>New visit</CardTitle>
        </CardHeader>
        <CardContent>
          <VisitForm
            action={createVisitAction}
            types={types}
            clients={clients}
            technicians={technicians}
            submitLabel="Create visit"
          />
        </CardContent>
      </Card>
    </div>
  );
}
