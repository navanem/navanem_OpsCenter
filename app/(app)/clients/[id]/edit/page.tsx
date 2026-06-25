import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { getClient } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { listClientIndustries } from "@/lib/taxonomies/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ClientForm } from "../../client-form";
import { updateClientAction } from "../../actions";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("clients.manage");
  const { id } = await params;
  const [client, technicians, industries] = await Promise.all([
    getClient(id),
    listTechnicians(),
    listClientIndustries({ activeOnly: true }),
  ]);
  if (!client) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Clients", href: "/clients" }, { label: client.companyName, href: `/clients/${client.id}` }, { label: "Edit" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">Edit client</h1>
      <Card>
        <CardHeader>
          <CardTitle>{client.companyName}</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm
            action={updateClientAction}
            technicians={technicians}
            industries={industries}
            defaults={client}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
