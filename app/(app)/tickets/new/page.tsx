import { requirePermission } from "@/lib/auth/guard";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { listTicketCategories, listTicketPriorities, listTicketTags, listTicketTypes } from "@/lib/taxonomies/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TicketForm } from "../ticket-form";

export default async function NewTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; deviceId?: string }>;
}) {
  await requirePermission("tickets.manage");
  const sp = await searchParams;
  const [clients, technicians, categories, priorities, tags, types] = await Promise.all([
    listClients({}),
    listTechnicians(),
    listTicketCategories({ activeOnly: true }),
    listTicketPriorities({ activeOnly: true }),
    listTicketTags({ activeOnly: true }),
    listTicketTypes({ activeOnly: true }),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Tickets", href: "/tickets" }, { label: "New ticket" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">New ticket</h1>
      <Card>
        <CardHeader>
          <CardTitle>Ticket details</CardTitle>
        </CardHeader>
        <CardContent>
          <TicketForm
            clients={clients}
            technicians={technicians}
            categories={categories}
            priorities={priorities}
            types={types.map((t) => ({ id: t.id, name: t.name }))}
            tags={tags.map((t) => ({ id: t.id, name: t.name, color: t.color }))}
            defaultClientId={sp.clientId}
            deviceId={sp.deviceId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
