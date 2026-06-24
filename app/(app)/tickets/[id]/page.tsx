import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { getTicket } from "@/lib/tickets/queries";
import { listTechnicians } from "@/lib/users/queries";
import {
  TICKET_STATUS_META,
  TICKET_STATUSES,
  TICKET_PRIORITY_META,
  TICKET_PRIORITIES,
  TICKET_CATEGORY_META,
  formatTicketReference,
} from "@/lib/tickets/meta";
import { StatusBadge, PriorityBadge } from "@/components/tickets/badges";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  updateStatusAction,
  updatePriorityAction,
  assignTicketAction,
} from "../actions";
import { CommentForm } from "./comment-form";

const selectClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

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

  const priorityLabel = (v: string | null): string => {
    if (!v) return "Unknown";
    return v in TICKET_PRIORITY_META
      ? TICKET_PRIORITY_META[v as keyof typeof TICKET_PRIORITY_META].label
      : v;
  };

  switch (activity.type) {
    case "CREATED":
      return `${actor} created the ticket`;
    case "STATUS_CHANGED":
      return `${actor} changed status from ${statusLabel(activity.fromValue)} to ${statusLabel(activity.toValue)}`;
    case "PRIORITY_CHANGED":
      return `${actor} changed priority from ${priorityLabel(activity.fromValue)} to ${priorityLabel(activity.toValue)}`;
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
  const ticket = await getTicket(id);
  if (!ticket) notFound();

  const technicians = await listTechnicians();

  const canManage = can(user, "tickets.manage");
  const canAssign = can(user, "tickets.assign");

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <p className="font-mono text-sm text-[var(--muted-foreground)]">
          {formatTicketReference(ticket.number)}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight flex-1 min-w-0">
            {ticket.subject}
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={ticket.status as keyof typeof TICKET_STATUS_META} />
            <PriorityBadge priority={ticket.priority as keyof typeof TICKET_PRIORITY_META} />
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
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {ticket.description}
                </p>
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
                  {ticket.comments.map((comment) => (
                    <div key={comment.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {comment.author.firstName} {comment.author.lastName}
                        </span>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {comment.createdAt.toLocaleString()}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {comment.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {canManage && <CommentForm ticketId={ticket.id} />}
            </CardContent>
          </Card>
        </div>

        {/* SIDE column */}
        <div className="space-y-6">
          {/* Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[var(--muted-foreground)]">Client</span>
                  <span className="font-medium">{ticket.client.companyName}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[var(--muted-foreground)]">Category</span>
                  <span className="font-medium">
                    {ticket.category in TICKET_CATEGORY_META
                      ? TICKET_CATEGORY_META[ticket.category as keyof typeof TICKET_CATEGORY_META].label
                      : ticket.category}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[var(--muted-foreground)]">Created by</span>
                  <span className="font-medium">
                    {ticket.createdBy.firstName} {ticket.createdBy.lastName}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[var(--muted-foreground)]">Created</span>
                  <span className="font-medium">{ticket.createdAt.toLocaleString()}</span>
                </div>
                {ticket.closedAt && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[var(--muted-foreground)]">Closed</span>
                    <span className="font-medium">{ticket.closedAt.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[var(--muted-foreground)]">Assignee</span>
                  <span className="font-medium">
                    {ticket.assignee
                      ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}`
                      : "Unassigned"}
                  </span>
                </div>
              </div>

              {canManage && (
                <div className="space-y-3 border-t border-[var(--border)] pt-4">
                  {/* Status */}
                  <form action={updateStatusAction} className="flex flex-col gap-2">
                    <input type="hidden" name="id" value={ticket.id} />
                    <label className="text-xs font-medium text-[var(--muted-foreground)]">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue={ticket.status}
                      className={selectClass}
                    >
                      {TICKET_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {TICKET_STATUS_META[s].label}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" variant="outline" className="self-start">
                      Update status
                    </Button>
                  </form>

                  {/* Priority */}
                  <form action={updatePriorityAction} className="flex flex-col gap-2">
                    <input type="hidden" name="id" value={ticket.id} />
                    <label className="text-xs font-medium text-[var(--muted-foreground)]">
                      Priority
                    </label>
                    <select
                      name="priority"
                      defaultValue={ticket.priority}
                      className={selectClass}
                    >
                      {TICKET_PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {TICKET_PRIORITY_META[p].label}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" variant="outline" className="self-start">
                      Update priority
                    </Button>
                  </form>
                </div>
              )}

              {canAssign && (
                <div className="border-t border-[var(--border)] pt-4">
                  <form action={assignTicketAction} className="flex flex-col gap-2">
                    <input type="hidden" name="id" value={ticket.id} />
                    <label className="text-xs font-medium text-[var(--muted-foreground)]">
                      Assignee
                    </label>
                    <select
                      name="assigneeId"
                      defaultValue={ticket.assignee?.id ?? ""}
                      className={selectClass}
                    >
                      <option value="">Unassigned</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.firstName} {t.lastName}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" variant="outline" className="self-start">
                      Assign
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.activities.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">No activity yet.</p>
              ) : (
                <ol className="space-y-3">
                  {ticket.activities.map((activity) => (
                    <li key={activity.id} className="flex flex-col gap-0.5">
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
      </div>
    </div>
  );
}
