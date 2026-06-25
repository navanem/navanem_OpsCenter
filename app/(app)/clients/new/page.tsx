import { requirePermission } from "@/lib/auth/guard";
import { listTechnicians } from "@/lib/users/queries";
import { listClientIndustries } from "@/lib/taxonomies/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ClientForm } from "../client-form";
import { createClientAction } from "../actions";

export default async function NewClientPage() {
  await requirePermission("clients.manage");
  const [technicians, industries] = await Promise.all([
    listTechnicians(),
    listClientIndustries({ activeOnly: true }),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Clients", href: "/clients" }, { label: "New client" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">New client</h1>
      <Card>
        <CardHeader>
          <CardTitle>Client details</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm action={createClientAction} technicians={technicians} industries={industries} submitLabel="Create client" />
        </CardContent>
      </Card>
    </div>
  );
}
