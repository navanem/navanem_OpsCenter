import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { getClient } from "@/lib/clients/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteClientAction } from "../actions";

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[var(--border)] py-2 last:border-0">
      <span className="text-[var(--muted-foreground)]">{label}</span>
      <span className="text-right">{value && value.length > 0 ? value : "—"}</span>
    </div>
  );
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePermission("clients.read");
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const manage = can(user, "clients.manage");
  const technician = client.assignedTechnician
    ? `${client.assignedTechnician.firstName} ${client.assignedTechnician.lastName}`
    : "Unassigned";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{client.companyName}</h1>
        {manage ? (
          <div className="flex gap-2">
            <Link href={`/clients/${client.id}/edit`}>
              <Button variant="outline">Edit</Button>
            </Link>
            <form action={deleteClientAction}>
              <input type="hidden" name="id" value={client.id} />
              <Button variant="outline" type="submit">Delete</Button>
            </form>
          </div>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <Row label="Status" value={client.status === "ACTIVE" ? "Active" : "Inactive"} />
          <Row label="Domain" value={client.domain} />
          <Row label="Assigned technician" value={technician} />
          <Row label="Contact name" value={client.contactName} />
          <Row label="Contact email" value={client.contactEmail} />
          <Row label="Contact phone" value={client.contactPhone} />
          <Row label="Address" value={client.address} />
          <Row label="City" value={client.city} />
          <Row label="Postal code" value={client.postalCode} />
          <Row label="Country" value={client.country} />
          <Row label="Notes" value={client.notes} />
        </CardContent>
      </Card>
    </div>
  );
}
