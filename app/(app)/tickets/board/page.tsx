import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { listTickets } from "@/lib/tickets/queries";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TicketBoard, type BoardTicket } from "./ticket-board";

export default async function TicketBoardPage() {
  const user = await requirePermission("tickets.read");
  const tickets = await listTickets({});
  const board: BoardTicket[] = tickets.map((t) => ({
    id: t.id,
    number: t.number,
    subject: t.subject,
    status: t.status,
    priority: t.priority,
    clientName: t.client.companyName,
    assigneeName: t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : null,
  }));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Tickets", href: "/tickets" }, { label: "Board" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Tickets — Board</h1>
        <div className="flex gap-2">
          <Link href="/tickets"><Button variant="outline">List view</Button></Link>
          {can(user, "tickets.manage") ? <Link href="/tickets/new"><Button>New ticket</Button></Link> : null}
        </div>
      </div>
      <TicketBoard initial={board} canManage={can(user, "tickets.manage")} />
    </div>
  );
}
