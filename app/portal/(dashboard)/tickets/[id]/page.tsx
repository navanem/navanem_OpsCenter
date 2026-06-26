import Link from "next/link";
import { notFound } from "next/navigation";
import { requireContact } from "@/lib/portal/current-contact";
import { getPortalTicket } from "@/lib/portal/queries";
import { formatTicketReference, TICKET_STATUS_META, type TicketStatusKey } from "@/lib/tickets/meta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalCommentForm } from "./comment-form";

export default async function PortalTicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const contact = await requireContact();
  const { id } = await params;
  const ticket = await getPortalTicket(id, contact.clientId);
  if (!ticket) notFound();

  const m = TICKET_STATUS_META[ticket.status as TicketStatusKey];

  return (
    <>
      <div className="flex items-center justify-between">
        <Link href="/portal" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">← Your tickets</Link>
        <span className="font-mono text-xs text-[var(--muted-foreground)]">{formatTicketReference(ticket.number)}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight flex-1 min-w-0">{ticket.subject}</h1>
        <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${m.color}22`, color: m.color }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
          {m.label}
        </span>
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${ticket.priority.color}22`, color: ticket.priority.color }}>
          {ticket.priority.name}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{ticket.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.comments.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">No replies yet.</p>
          ) : (
            ticket.comments.map((comment) => {
              const who = comment.author ?? comment.authorContact;
              const isClient = Boolean(comment.authorContact);
              return (
                <div key={comment.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{who ? `${who.firstName} ${who.lastName}` : "Support"}</span>
                    {!isClient ? (
                      <span className="rounded-full bg-[var(--muted)] px-1.5 py-0.5 text-[10px] text-[var(--muted-foreground)]">support</span>
                    ) : null}
                    <span className="text-xs text-[var(--muted-foreground)]">{comment.createdAt.toLocaleString()}</span>
                  </div>
                  <p className="whitespace-pre-wrap rounded-[var(--radius)] bg-[var(--muted)] p-3 text-sm leading-relaxed">{comment.body}</p>
                </div>
              );
            })
          )}
          {contact.canComment ? (
            <div className="border-t border-[var(--border)] pt-4">
              <PortalCommentForm ticketId={ticket.id} />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </>
  );
}
