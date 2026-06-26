import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { getTicket } from "@/lib/tickets/queries";
import { listTechnicians } from "@/lib/users/queries";
import { listTicketPriorities, listTicketTags } from "@/lib/taxonomies/queries";
import { isDevicesEnabled } from "@/lib/settings/service";
import { listClientDevices } from "@/lib/devices/queries";
import { formatDeviceReference } from "@/lib/devices/meta";
import {
  TICKET_STATUS_META,
  TICKET_STATUSES,
  formatTicketReference,
  isTicketOverdue,
} from "@/lib/tickets/meta";
import { StatusBadge, PriorityBadge, CategoryBadge } from "@/components/tickets/badges";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TimeLogSection } from "@/components/timesheets/time-log-section";
import { InlineSelect, InlineDate, InlineTags } from "./inline-controls";
import { CommentForm } from "./comment-form";
import {
  updateStatusAction,
  updatePriorityAction,
  assignTicketAction,
  updateDueDateAction,
  updateTicketTagsAction,
  updateTicketDeviceAction,
} from "../actions";

function toLocalDateTime(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  const p = (n: number) => `${n}`.padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
}

// Stacked label + control, used for the editable fields in the Details card.
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-[var(--muted-foreground)]">{label}</span>
      {children}
    </div>
  );
}

// Compact read-only row: muted label on the left, value on the right.
function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-[var(--muted-foreground)]">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

function activitySentence(activity: {
  type: string;
  fromValue: string | null;
  toValue: string | null;
  actor: { firstName: string; lastName: string } | null;
}): string {
  const actor = activity.actor
    ? `${activity.actor.firstName} ${activity.actor.lastName}`
    : "Someone";

  const statusLabel = (v: string | null): string => {
    if (!v) return "Unknown";
    return v in TICKET_STATUS_META
      ? TICKET_STATUS_META[v as keyof typeof TICKET_STATUS_META].label
      : v;
  };

  switch (activity.type) {
    case "CREATED":
      return `${actor} created the ticket`;
    case "STATUS_CHANGED":
      return `${actor} changed status from ${statusLabel(activity.fromValue)} to ${statusLabel(activity.toValue)}`;
    case "PRIORITY_CHANGED":
      return `${actor} changed priority from ${activity.fromValue ?? "Unknown"} to ${activity.toValue ?? "Unknown"}`;
    case "ASSIGNED":
      return `${actor} assigned the ticket`;
    case "UNASSIGNED":
      return `${actor} unassigned the ticket`;
    case "COMMENTED":
      return `${actor} commented`;
    default:
      return `${actor} performed an action`;
  }
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePermission("tickets.read");
  const { id } = await params;
  const [ticket, technicians, priorities, allTags] = await Promise.all([
    getTicket(id),
    listTechnicians(),
    listTicketPriorities({ activeOnly: true }),
    listTicketTags({ activeOnly: true }),
  ]);
  if (!ticket) notFound();

  const canManage = can(user, "tickets.manage");
  const canAssign = can(user, "tickets.assign");
  const devicesEnabled = (await isDevicesEnabled()) && can(user, "devices.read");
  const clientDevices = devicesEnabled ? await listClientDevices(ticket.client.id) : [];

  const hidden = { id: ticket.id };
  const overdue = isTicketOverdue(ticket.dueAt, ticket.status);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Tickets", href: "/tickets" }, { label: formatTicketReference(ticket.number) }]} />

      {/* Header */}
      <div className="space-y-1">
        <span className="inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs text-[var(--muted-foreground)]">
          {formatTicketReference(ticket.number)}
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight flex-1 min-w-0">
            {ticket.subject}
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={ticket.status as keyof typeof TICKET_STATUS_META} />
            <PriorityBadge name={ticket.priority.name} color={ticket.priority.color} />
            {overdue ? (
              <span className="rounded-full bg-[#ef444422] px-2 py-0.5 text-xs font-medium text-[#ef4444]">Overdue</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Body layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* MAIN column (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.description ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{ticket.description}</p>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)]">No description provided.</p>
              )}
            </CardContent>
          </Card>

          {/* Conversation */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.comments.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">No comments yet.</p>
              ) : (
                <div className="space-y-4">
                  {ticket.comments.map((comment) => {
                    const who = comment.author ?? comment.authorContact;
                    const initials = (
                      (who?.firstName?.[0] ?? "") + (who?.lastName?.[0] ?? "")
                    ).toUpperCase();
                    return (
                      <div key={comment.id} className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-medium">
                          {initials}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {who ? `${who.firstName} ${who.lastName}` : "Unknown"}
                              {comment.authorContact ? (
                                <span className="ml-1.5 rounded-full bg-[var(--muted)] px-1.5 py-0.5 text-[10px] font-normal text-[var(--muted-foreground)]">client</span>
                              ) : null}
                            </span>
                            <span className="text-xs text-[var(--muted-foreground)]">
                              {comment.createdAt.toLocaleString()}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap rounded-[var(--radius)] bg-[var(--muted)] p-3 text-sm leading-relaxed">
                            {comment.body}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {canManage && <CommentForm ticketId={ticket.id} />}
            </CardContent>
          </Card>

          {/* Activity timeline (full reading width) */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.activities.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">No activity yet.</p>
              ) : (
                <ol className="relative border-l border-[var(--border)] pl-4 space-y-4">
                  {ticket.activities.map((activity) => (
                    <li key={activity.id} className="relative flex flex-col gap-0.5">
                      <div className="absolute -left-[21px] top-[6px] h-2 w-2 rounded-full bg-[var(--muted-foreground)]" />
                      <span className="text-sm">{activitySentence(activity)}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {activity.createdAt.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>

        {/* SIDE column */}
        <div className="space-y-6">
          <TimeLogSection
            context={{ ticketId: ticket.id, label: `Linked to ${formatTicketReference(ticket.number)}` }}
            redirectTo={`/tickets/${ticket.id}`}
          />

          {/* Details — editable controls auto-submit on change (no buttons) */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-3">
                <Field label="Status">
                  {canManage ? (
                    <InlineSelect
                      action={updateStatusAction}
                      name="status"
                      hidden={hidden}
                      defaultValue={ticket.status}
                      options={TICKET_STATUSES.map((s) => ({ value: s, label: TICKET_STATUS_META[s].label }))}
                    />
                  ) : (
                    <StatusBadge status={ticket.status as keyof typeof TICKET_STATUS_META} />
                  )}
                </Field>

                <Field label="Priority">
                  {canManage ? (
                    <InlineSelect
                      action={updatePriorityAction}
                      name="priorityId"
                      hidden={hidden}
                      defaultValue={ticket.priorityId}
                      options={priorities.map((p) => ({ value: p.id, label: p.name }))}
                    />
                  ) : (
                    <PriorityBadge name={ticket.priority.name} color={ticket.priority.color} />
                  )}
                </Field>

                <Field label="Assignee">
                  {canAssign ? (
                    <InlineSelect
                      action={assignTicketAction}
                      name="assigneeId"
                      hidden={hidden}
                      defaultValue={ticket.assignee?.id ?? ""}
                      emptyLabel="Unassigned"
                      options={technicians.map((t) => ({ value: t.id, label: `${t.firstName} ${t.lastName}` }))}
                    />
                  ) : (
                    <span className="font-medium">
                      {ticket.assignee ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}` : "Unassigned"}
                    </span>
                  )}
                </Field>

                <Field label="Due date">
                  {canManage ? (
                    <InlineDate action={updateDueDateAction} name="dueAt" hidden={hidden} defaultValue={toLocalDateTime(ticket.dueAt)} />
                  ) : (
                    <span className={`font-medium ${overdue ? "text-[#ef4444]" : ""}`}>
                      {ticket.dueAt ? new Date(ticket.dueAt).toLocaleString() : "—"}
                    </span>
                  )}
                </Field>

                {devicesEnabled ? (
                  <Field label="Device">
                    {canManage ? (
                      <InlineSelect
                        action={updateTicketDeviceAction}
                        name="deviceId"
                        hidden={hidden}
                        defaultValue={ticket.deviceId ?? ""}
                        emptyLabel="None"
                        options={clientDevices.map((d) => ({ value: d.id, label: d.name }))}
                      />
                    ) : ticket.device ? (
                      <Link href={`/devices/${ticket.device.id}/edit`} className="font-medium hover:underline">
                        <span className="font-mono text-xs text-[var(--muted-foreground)]">{formatDeviceReference(ticket.device.number)}</span>{" "}
                        {ticket.device.name}
                      </Link>
                    ) : (
                      <span className="text-[var(--muted-foreground)]">None</span>
                    )}
                  </Field>
                ) : null}

                {allTags.length > 0 ? (
                  <Field label="Tags">
                    {canManage ? (
                      <InlineTags action={updateTicketTagsAction} hidden={hidden} allTags={allTags} selectedIds={ticket.tags.map((t) => t.id)} />
                    ) : ticket.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {ticket.tags.map((tag) => (
                          <span key={tag.id} className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${tag.color}22`, color: tag.color }}>
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[var(--muted-foreground)]">None</span>
                    )}
                  </Field>
                ) : null}
              </div>

              {/* Read-only facts */}
              <div className="space-y-2.5 border-t border-[var(--border)] pt-4">
                <Fact label="Client">
                  <Link href={`/clients/${ticket.client.id}`} className="font-medium hover:underline">{ticket.client.companyName}</Link>
                </Fact>
                <Fact label="Category">
                  <CategoryBadge name={ticket.category.name} color={ticket.category.color} />
                </Fact>
                <Fact label="Created by">
                  <span className="font-medium">
                    {ticket.createdBy
                      ? `${ticket.createdBy.firstName} ${ticket.createdBy.lastName}`
                      : ticket.createdByContact
                        ? `${ticket.createdByContact.firstName} ${ticket.createdByContact.lastName} (client)`
                        : "—"}
                  </span>
                </Fact>
                <Fact label="Created">
                  <span className="font-medium">{ticket.createdAt.toLocaleString()}</span>
                </Fact>
                {ticket.closedAt ? (
                  <Fact label="Closed">
                    <span className="font-medium">{ticket.closedAt.toLocaleString()}</span>
                  </Fact>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
