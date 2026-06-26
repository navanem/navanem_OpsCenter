import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { getClient } from "@/lib/clients/queries";
import { listTickets } from "@/lib/tickets/queries";
import { listProjects } from "@/lib/projects/queries";
import { listClientVisits } from "@/lib/planning/queries";
import { listContracts } from "@/lib/contracts/queries";
import { listClientDevices } from "@/lib/devices/queries";
import { listClientContacts } from "@/lib/contacts/queries";
import { isContractsEnabled, isDevicesEnabled } from "@/lib/settings/service";
import { DeviceBadge } from "@/components/devices/badges";
import { formatDeviceReference } from "@/lib/devices/meta";
import { formatTicketReference } from "@/lib/tickets/meta";
import type { TicketStatusKey } from "@/lib/tickets/meta";
import { formatProjectReference } from "@/lib/projects/meta";
import { formatContractReference, formatMoneyCents, billingCycleLabel } from "@/lib/contracts/meta";
import { ContractBadge } from "@/components/contracts/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { StatusBadge, PriorityBadge } from "@/components/tickets/badges";
import { StatusBadge as ProjectStatusBadge } from "@/components/projects/badges";
import { VisitStatusBadge, TypeDot } from "@/components/planning/badges";
import { deleteClientAction } from "../actions";
import { deleteContactAction, grantPortalAccessAction, revokePortalAccessAction } from "./contacts/actions";

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
  const canReadProjects = can(user, "projects.read");
  const canReadVisits = can(user, "visits.read");
  const canReadContracts = can(user, "contracts.read") && (await isContractsEnabled());
  const canReadDevices = can(user, "devices.read") && (await isDevicesEnabled());

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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [projects, upcomingVisits, contracts, devices, contacts] = await Promise.all([
    canReadProjects ? listProjects({ clientId: id }) : Promise.resolve([]),
    canReadVisits ? listClientVisits(id, { from: today, take: 10 }) : Promise.resolve([]),
    canReadContracts ? listContracts({ clientId: id }) : Promise.resolve([]),
    canReadDevices ? listClientDevices(id) : Promise.resolve([]),
    listClientContacts(id),
  ]);

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

      {canReadProjects ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Projects{" "}
                <span className="text-[var(--muted-foreground)] font-normal text-sm">
                  ({projects.length})
                </span>
              </CardTitle>
              {can(user, "projects.manage") && (
                <Link href="/projects/new">
                  <Button variant="outline">New project</Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="text-sm">
            {projects.length === 0 ? (
              <p className="text-[var(--muted-foreground)]">No projects.</p>
            ) : (
              <div>
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between border-b border-[var(--border)] py-2 last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-xs text-[var(--muted-foreground)] shrink-0">
                        {formatProjectReference(p.number)}
                      </span>
                      <Link href={`/projects/${p.id}`} className="font-medium hover:underline truncate">
                        {p.name}
                      </Link>
                      <span className="text-xs text-[var(--muted-foreground)] shrink-0">
                        {p._count.tasks} task{p._count.tasks === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {p.lead ? `${p.lead.firstName} ${p.lead.lastName}` : "No lead"}
                      </span>
                      <ProjectStatusBadge name={p.status.name} color={p.status.color} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {canReadVisits ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Upcoming visits{" "}
                <span className="text-[var(--muted-foreground)] font-normal text-sm">
                  ({upcomingVisits.length})
                </span>
              </CardTitle>
              {can(user, "visits.manage") && (
                <Link href="/planning/visits/new">
                  <Button variant="outline">New visit</Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="text-sm">
            {upcomingVisits.length === 0 ? (
              <p className="text-[var(--muted-foreground)]">No upcoming visits.</p>
            ) : (
              <div>
                {upcomingVisits.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between border-b border-[var(--border)] py-2 last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-xs text-[var(--muted-foreground)] shrink-0">
                        {new Date(v.scheduledAt).toLocaleDateString()}{" "}
                        {new Date(v.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
                      </span>
                      <Link href={`/planning/visits/${v.id}/edit`} className="flex items-center gap-1.5 font-medium hover:underline truncate">
                        <TypeDot color={v.type.color ?? "#6b7280"} />
                        {v.title}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {v.assignee ? `${v.assignee.firstName} ${v.assignee.lastName}` : "Unassigned"}
                      </span>
                      <VisitStatusBadge status={v.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {canReadContracts ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Contracts{" "}
                <span className="text-[var(--muted-foreground)] font-normal text-sm">
                  ({contracts.length})
                </span>
              </CardTitle>
              {can(user, "contracts.manage") && (
                <Link href="/contracts/new">
                  <Button variant="outline">New contract</Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="text-sm">
            {contracts.length === 0 ? (
              <p className="text-[var(--muted-foreground)]">No contracts.</p>
            ) : (
              <div>
                {contracts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between border-b border-[var(--border)] py-2 last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Link href={`/contracts/${c.id}/edit`} className="font-mono text-xs text-[var(--muted-foreground)] shrink-0 hover:underline">
                        {formatContractReference(c.number)}
                      </Link>
                      <ContractBadge name={c.type.name} color={c.type.color} />
                      {c.name ? <span className="truncate text-[var(--muted-foreground)]">{c.name}</span> : null}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {formatMoneyCents(c.valueCents)} / {billingCycleLabel(c.billingCycle).toLowerCase()}
                      </span>
                      <ContractBadge name={c.status.name} color={c.status.color} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {canReadDevices ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Devices{" "}
                <span className="text-[var(--muted-foreground)] font-normal text-sm">
                  ({devices.length})
                </span>
              </CardTitle>
              {can(user, "devices.manage") && (
                <Link href="/devices/new">
                  <Button variant="outline">New device</Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="text-sm">
            {devices.length === 0 ? (
              <p className="text-[var(--muted-foreground)]">No devices.</p>
            ) : (
              <div>
                {devices.map((d) => (
                  <div key={d.id} className="flex items-center justify-between border-b border-[var(--border)] py-2 last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Link href={`/devices/${d.id}/edit`} className="font-mono text-xs text-[var(--muted-foreground)] shrink-0 hover:underline">
                        {formatDeviceReference(d.number)}
                      </Link>
                      <span className="font-medium truncate">{d.name}</span>
                      <DeviceBadge name={d.type.name} color={d.type.color} />
                    </div>
                    <DeviceBadge name={d.status.name} color={d.status.color} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

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
                          {c.portalEnabled && (
                            <span className="bg-[#10b98122] text-[#10b981] rounded-full px-2 py-0.5 text-xs shrink-0">
                              Portal
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
                        {c.email ? (
                          c.portalEnabled ? (
                            <form action={revokePortalAccessAction}>
                              <input type="hidden" name="id" value={c.id} />
                              <input type="hidden" name="clientId" value={id} />
                              <button type="submit" className="text-xs text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors">
                                Revoke portal
                              </button>
                            </form>
                          ) : (
                            <form action={grantPortalAccessAction}>
                              <input type="hidden" name="id" value={c.id} />
                              <input type="hidden" name="clientId" value={id} />
                              <button type="submit" className="text-xs text-[var(--primary)] hover:underline transition-colors">
                                Grant portal
                              </button>
                            </form>
                          )
                        ) : null}
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
