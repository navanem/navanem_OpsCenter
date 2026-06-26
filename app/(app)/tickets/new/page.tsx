import { requirePermission } from "@/lib/auth/guard";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { listTicketCategories, listTicketPriorities, listTicketTags } from "@/lib/taxonomies/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TicketForm } from "../ticket-form";

export default async function NewTicketPage() {
  await requirePermission("tickets.manage");
  const [clients, technicians, categories, priorities, tags] = await Promise.all([
    listClients({}),
    listTechnicians(),
    listTicketCategories({ activeOnly: true }),
    listTicketPriorities({ activeOnly: true }),
    listTicketTags({ activeOnly: true }),
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
            tags={tags.map((t) => ({ id: t.id, name: t.name, color: t.color }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
