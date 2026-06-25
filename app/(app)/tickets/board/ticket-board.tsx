"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TICKET_STATUS_META, TICKET_STATUSES, formatTicketReference } from "@/lib/tickets/meta";
import { PriorityBadge } from "@/components/tickets/badges";
import { moveTicketAction } from "../actions";

export interface BoardTicket {
  id: string;
  number: number;
  subject: string;
  status: string;
  priorityName: string;
  priorityColor: string;
  clientName: string;
  assigneeName: string | null;
}

export function TicketBoard({ initial, canManage }: { initial: BoardTicket[]; canManage: boolean }) {
  const [tickets, setTickets] = useState(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function onDrop(status: string) {
    if (!dragId || !canManage) return;
    const id = dragId;
    setDragId(null);
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t))); // optimistic
    startTransition(async () => {
      await moveTicketAction(id, status);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {TICKET_STATUSES.map((status) => {
        const meta = TICKET_STATUS_META[status];
        const column = tickets.filter((t) => t.status === status);
        return (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(status)}
            className="flex w-72 shrink-0 flex-col rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)]"
          >
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
              <span className="text-sm font-bold">{meta.label}</span>
              <span className="ml-auto text-xs text-[var(--muted-foreground)]">{column.length}</span>
            </div>
            <div className="flex min-h-24 flex-col gap-2 p-3">
              {column.map((t) => (
                <div
                  key={t.id}
                  draggable={canManage}
                  onDragStart={() => setDragId(t.id)}
                  className="cursor-grab rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] p-3 text-sm shadow-sm transition hover:border-[var(--ring)] active:cursor-grabbing"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-mono text-xs text-[var(--muted-foreground)]">{formatTicketReference(t.number)}</span>
                    <PriorityBadge name={t.priorityName} color={t.priorityColor} />
                  </div>
                  <Link href={`/tickets/${t.id}`} className="font-medium hover:underline">{t.subject}</Link>
                  <div className="mt-1 text-xs text-[var(--muted-foreground)]">{t.clientName}</div>
                  <div className="mt-0.5 text-xs text-[var(--muted-foreground)]">{t.assigneeName ?? "Unassigned"}</div>
                </div>
              ))}
              {column.length === 0 ? <p className="px-1 py-2 text-xs text-[var(--muted-foreground)]">No tickets</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
