import Link from "next/link";
import { formatTicketReference } from "@/lib/tickets/meta";

export interface EntryRelations {
  ticket?: { id: string; number: number; subject: string } | null;
  task?: { id: string; title: string } | null;
  visit?: { id: string; title: string } | null;
  client?: { id: string; companyName: string } | null;
}

// Renders a link to whatever a time entry / timer is attached to.
export function EntryContext({ entry }: { entry: EntryRelations }) {
  if (entry.ticket) {
    return (
      <Link href={`/tickets/${entry.ticket.id}`} className="hover:underline">
        <span className="font-mono text-xs text-[var(--muted-foreground)]">
          {formatTicketReference(entry.ticket.number)}
        </span>{" "}
        {entry.ticket.subject}
      </Link>
    );
  }
  if (entry.task) {
    return <span>{entry.task.title}</span>;
  }
  if (entry.visit) {
    return (
      <Link href={`/planning/visits/${entry.visit.id}/edit`} className="hover:underline">
        {entry.visit.title}
      </Link>
    );
  }
  if (entry.client) {
    return (
      <Link href={`/clients/${entry.client.id}`} className="hover:underline">
        {entry.client.companyName}
      </Link>
    );
  }
  return <span className="text-[var(--muted-foreground)]">General</span>;
}

export function relationLabel(entry: EntryRelations): string {
  if (entry.ticket) return `${formatTicketReference(entry.ticket.number)} ${entry.ticket.subject}`;
  if (entry.task) return entry.task.title;
  if (entry.visit) return entry.visit.title;
  if (entry.client) return entry.client.companyName;
  return "General";
}
