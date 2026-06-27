"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/provider";
import { formatOpportunityReference, formatMoneyCents } from "@/lib/crm/meta";
import { moveOpportunityAction, markOutcomeAction } from "./actions";

export interface BoardOpportunity {
  id: string;
  number: number;
  name: string;
  stageId: string | null;
  clientName: string | null;
  ownerName: string | null;
  valueCents: number | null;
  outcome: string;
}

export interface BoardStage {
  id: string;
  name: string;
  color: string;
}

const UNASSIGNED = "__unassigned__";

function OutcomeDot({ outcome }: { outcome: string }) {
  const color = outcome === "WON" ? "#10b981" : outcome === "LOST" ? "#ef4444" : "#3b82f6";
  return <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />;
}

export function PipelineBoard({
  stages,
  initial,
  canManage,
}: {
  stages: BoardStage[];
  initial: BoardOpportunity[];
  canManage: boolean;
}) {
  const [opps, setOpps] = useState(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const dict = useT();

  const columns: BoardStage[] = [...stages, { id: UNASSIGNED, name: dict.common.none, color: "#6b7280" }];

  function onDrop(columnId: string) {
    setOverId(null);
    if (!dragId || !canManage) return;
    const id = dragId;
    setDragId(null);
    const stageId = columnId === UNASSIGNED ? null : columnId;
    setOpps((prev) => prev.map((o) => (o.id === id ? { ...o, stageId } : o))); // optimistic
    startTransition(async () => {
      await moveOpportunityAction(id, stageId ?? "");
      router.refresh();
    });
  }

  function setOutcome(id: string, outcome: string) {
    if (!canManage) return;
    setOpps((prev) => prev.map((o) => (o.id === id ? { ...o, outcome } : o))); // optimistic
    startTransition(async () => {
      await markOutcomeAction(id, outcome);
      router.refresh();
    });
  }

  function columnOpps(columnId: string) {
    return columnId === UNASSIGNED
      ? opps.filter((o) => !o.stageId)
      : opps.filter((o) => o.stageId === columnId);
  }

  function columnTotalCents(columnId: string) {
    return columnOpps(columnId).reduce((sum, o) => sum + (o.valueCents ?? 0), 0);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((stage) => {
        const column = columnOpps(stage.id);
        return (
          <div
            key={stage.id}
            onDragOver={(e) => { e.preventDefault(); setOverId(stage.id); }}
            onDragLeave={() => setOverId((cur) => (cur === stage.id ? null : cur))}
            onDrop={() => onDrop(stage.id)}
            className={
              "flex w-72 shrink-0 flex-col rounded-[var(--radius)] border bg-[var(--card)] transition-colors " +
              (overId === stage.id ? "border-[var(--ring)]" : "border-[var(--border)]")
            }
          >
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
              <span className="text-sm font-bold">{stage.name}</span>
              <span className="ml-auto text-xs text-[var(--muted-foreground)]">{column.length}</span>
            </div>
            <div className="border-b border-[var(--border)] px-4 py-1.5 text-xs tabular-nums text-[var(--muted-foreground)]">
              {formatMoneyCents(columnTotalCents(stage.id))}
            </div>
            <div className="flex min-h-24 flex-col gap-2 p-3">
              {column.map((o) => (
                <div
                  key={o.id}
                  draggable={canManage}
                  onDragStart={() => setDragId(o.id)}
                  onDragEnd={() => { setDragId(null); setOverId(null); }}
                  className="cursor-grab rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] p-3 text-sm shadow-sm transition hover:border-[var(--ring)] active:cursor-grabbing"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-[var(--muted-foreground)]">{formatOpportunityReference(o.number)}</span>
                    <span className="flex items-center gap-1 text-xs tabular-nums text-[var(--muted-foreground)]">
                      <OutcomeDot outcome={o.outcome} />
                      {formatMoneyCents(o.valueCents)}
                    </span>
                  </div>
                  <Link href={`/crm/${o.id}/edit`} className="font-medium hover:underline">{o.name}</Link>
                  <div className="mt-1 text-xs text-[var(--muted-foreground)]">{o.clientName ?? "—"}</div>
                  <div className="mt-0.5 text-xs text-[var(--muted-foreground)]">{o.ownerName ?? dict.common.unassigned}</div>
                  {canManage ? (
                    <div className="mt-2 flex items-center gap-1.5 border-t border-[var(--border)] pt-2">
                      {o.outcome === "OPEN" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setOutcome(o.id, "WON")}
                            className="rounded-[var(--radius-sm)] bg-[#10b98115] px-2 py-1 text-[11px] font-medium text-[#10b981] transition hover:bg-[#10b98125]"
                          >
                            {dict.crm.markWon}
                          </button>
                          <button
                            type="button"
                            onClick={() => setOutcome(o.id, "LOST")}
                            className="rounded-[var(--radius-sm)] bg-[#ef444415] px-2 py-1 text-[11px] font-medium text-[#ef4444] transition hover:bg-[#ef444425]"
                          >
                            {dict.crm.markLost}
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-[11px] font-medium" style={{ color: o.outcome === "WON" ? "#10b981" : "#ef4444" }}>
                            {o.outcome === "WON" ? dict.crm.outcomeWon : dict.crm.outcomeLost}
                          </span>
                          <button
                            type="button"
                            onClick={() => setOutcome(o.id, "OPEN")}
                            className="ml-auto rounded-[var(--radius-sm)] px-2 py-1 text-[11px] font-medium text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                          >
                            {dict.crm.reopen}
                          </button>
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
              {column.length === 0 ? <p className="px-1 py-2 text-xs text-[var(--muted-foreground)]">{dict.crm.noOpportunities}</p> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
