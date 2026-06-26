import Link from "next/link";
import { redirect } from "next/navigation";
import { requireContact } from "@/lib/portal/current-contact";
import { listTicketPriorities } from "@/lib/taxonomies/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalTicketForm } from "./ticket-form";

export default async function PortalNewTicketPage() {
  const contact = await requireContact();
  if (!contact.canCreate) redirect("/portal");
  const priorities = await listTicketPriorities({ activeOnly: true });

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">New ticket</h1>
        <Link href="/portal" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">← Back</Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tell us what you need</CardTitle>
        </CardHeader>
        <CardContent>
          <PortalTicketForm priorities={priorities.map((p) => ({ id: p.id, name: p.name }))} />
        </CardContent>
      </Card>
    </>
  );
}
