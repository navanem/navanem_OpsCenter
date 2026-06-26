import Link from "next/link";
import { requireContact } from "@/lib/portal/current-contact";
import { listPortalTickets } from "@/lib/portal/queries";
import { formatTicketReference, TICKET_STATUS_META, type TicketStatusKey } from "@/lib/tickets/meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function StatusPill({ status }: { status: TicketStatusKey }) {
  const m = TICKET_STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${m.color}22`, color: m.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
      {m.label}
    </span>
  );
}

export default async function PortalHome() {
  const contact = await requireContact();
  const tickets = await listPortalTickets(contact.clientId);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Your tickets</h1>
        <Link href="/portal/tickets/new"><Button>New ticket</Button></Link>
      </div>

      <Card>
        {tickets.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">You have no tickets yet. Create one to get started.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Ref</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Subject</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Priority</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/40">
                  <td className="px-4 py-3">
                    <Link href={`/portal/tickets/${t.id}`} className="inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs hover:underline">
                      {formatTicketReference(t.number)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/portal/tickets/${t.id}`} className="font-medium hover:underline">{t.subject}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${t.priority.color}22`, color: t.priority.color }}>
                      {t.priority.name}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusPill status={t.status as TicketStatusKey} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
