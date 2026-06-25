import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { getClient } from "@/lib/clients/queries";
import { listTickets } from "@/lib/tickets/queries";
import { listClientContacts } from "@/lib/contacts/queries";
import { formatTicketReference } from "@/lib/tickets/meta";
import type { TicketStatusKey } from "@/lib/tickets/meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { StatusBadge, PriorityBadge } from "@/components/tickets/badges";
import { deleteClientAction } from "../actions";
import { deleteContactAction } from "./contacts/actions";

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
  const canReadTickets = can(user, "tickets.read");
  const canManageTickets = can(user, "tickets.manage");

  const technician = client.assignedTechnician
    ? `${client.assignedTechnician.firstName} ${client.assignedTechnician.lastName}`
    : "Unassigned";

  let open: Awaited<ReturnType<typeof listTickets>> = [];
  let closed: Awaited<ReturnType<typeof listTickets>> = [];

  if (canReadTickets) {
    const tickets = await listTickets({ clientId: id });
    open = tickets.filter((t) =>
      ["OPEN", "IN_PROGRESS", "PENDING"].includes(t.status)
    );
    closed = tickets.filter((t) =>
      ["RESOLVED", "CLOSED"].includes(t.status)
    );
  }

  const contacts = await listClientContacts(id);

  const detailsCard = (
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <Row label="Status" value={client.status === "ACTIVE" ? "Active" : "Inactive"} />
        <Row label="Industry" value={client.industry?.name ?? "—"} />
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
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Clients", href: "/clients" }, { label: client.companyName }]} />
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

      {canReadTickets ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">{detailsCard}</div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Tickets{" "}
                    <span className="text-[var(--muted-foreground)] font-normal text-sm">
                      ({open.length + closed.length})
                    </span>
                  </CardTitle>
                  {canManageTickets && (
                    <Link href="/tickets/new">
                      <Button variant="outline">New ticket</Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-2">
                    Open ({open.length})
                  </p>
                  {open.length === 0 ? (
                    <p className="text-[var(--muted-foreground)]">No open tickets.</p>
                  ) : (
                    <div>
                      {open.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between border-b border-[var(--border)] py-2 last:border-0"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-xs text-[var(--muted-foreground)] shrink-0">
                              {formatTicketReference(t.number)}
                            </span>
                            <Link
                              href={`/tickets/${t.id}`}
                              className="font-medium hover:underline truncate"
                            >
                              {t.subject}
                            </Link>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-4">
                            <PriorityBadge name={t.priority.name} color={t.priority.color} />
                            <StatusBadge status={t.status as TicketStatusKey} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-2">
                    Closed ({closed.length})
                  </p>
                  {closed.length === 0 ? (
                    <p className="text-[var(--muted-foreground)]">No closed tickets.</p>
                  ) : (
                    <div>
                      {closed.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between border-b border-[var(--border)] py-2 last:border-0"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-xs text-[var(--muted-foreground)] shrink-0">
                              {formatTicketReference(t.number)}
                            </span>
                            <Link
                              href={`/tickets/${t.id}`}
                              className="font-medium hover:underline truncate"
                            >
                              {t.subject}
                            </Link>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-4">
                            <PriorityBadge name={t.priority.name} color={t.priority.color} />
                            <StatusBadge status={t.status as TicketStatusKey} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        detailsCard
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Contacts{" "}
              <span className="text-[var(--muted-foreground)] font-normal text-sm">
                ({contacts.length})
              </span>
            </CardTitle>
            {manage && (
              <Link href={`/clients/${id}/contacts/new`}>
                <Button variant="outline">Add contact</Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">No contacts yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {contacts.map((c) => {
                const hasPhoto = Boolean(c.photoData);
                return (
                  <div
                    key={c.id}
                    className="flex flex-col gap-2 rounded-[var(--radius)] border border-[var(--border)] p-4 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      {hasPhoto ? (
                        <img
                          src={`/api/contacts/${c.id}/photo`}
                          alt={`${c.firstName} ${c.lastName}`}
                          className="h-12 w-12 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-[var(--muted)] flex items-center justify-center shrink-0 text-sm font-medium text-[var(--muted-foreground)]">
                          {(c.firstName[0] + c.lastName[0]).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">
                            {c.firstName} {c.lastName}
                          </span>
                          {c.isVip && (
                            <span className="bg-[#f59e0b22] text-[#f59e0b] rounded-full px-2 py-0.5 text-xs shrink-0">
                              VIP
                            </span>
                          )}
                        </div>
                        {c.jobTitle && (
                          <p className="text-[var(--muted-foreground)] truncate">{c.jobTitle}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      {c.email && (
                        <p className="text-[var(--muted-foreground)] truncate">
                          <a href={`mailto:${c.email}`} className="hover:underline">
                            {c.email}
                          </a>
                        </p>
                      )}
                      {c.phone && (
                        <p className="text-[var(--muted-foreground)]">{c.phone}</p>
                      )}
                    </div>

                    {manage && (
                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          href={`/clients/${id}/contacts/${c.id}/edit`}
                          className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                        >
                          Edit
                        </Link>
                        <form action={deleteContactAction}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="clientId" value={id} />
                          <button
                            type="submit"
                            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
