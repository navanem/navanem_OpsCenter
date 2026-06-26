import { requirePermission } from "@/lib/auth/guard";
import { listVisitTypes } from "@/lib/taxonomies/queries";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { RecurringForm } from "../recurring-form";
import { createRecurringVisitAction } from "../../actions";

export default async function NewRecurringVisitPage() {
  await requirePermission("visits.manage");
  const [types, clients, technicians] = await Promise.all([
    listVisitTypes({ activeOnly: true }),
    listClients({}),
    listTechnicians(),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Planning", href: "/planning" },
          { label: "Recurring visits", href: "/planning/recurring" },
          { label: "New" },
        ]}
      />
      <h1 className="text-2xl font-semibold tracking-tight">New recurring visit</h1>
      <Card>
        <CardHeader>
          <CardTitle>New recurring visit</CardTitle>
        </CardHeader>
        <CardContent>
          <RecurringForm
            action={createRecurringVisitAction}
            types={types}
            clients={clients}
            technicians={technicians}
            submitLabel="Create recurring visit"
          />
        </CardContent>
      </Card>
    </div>
  );
}
