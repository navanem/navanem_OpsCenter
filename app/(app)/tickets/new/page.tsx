import { requirePermission } from "@/lib/auth/guard";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TicketForm } from "../ticket-form";

export default async function NewTicketPage() {
  await requirePermission("tickets.manage");
  const [clients, technicians] = await Promise.all([
    listClients({}),
    listTechnicians(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs items={[{ label: "Tickets", href: "/tickets" }, { label: "New ticket" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">New ticket</h1>
      <Card>
        <CardHeader>
          <CardTitle>Ticket details</CardTitle>
        </CardHeader>
        <CardContent>
          <TicketForm clients={clients} technicians={technicians} />
        </CardContent>
      </Card>
    </div>
  );
}
