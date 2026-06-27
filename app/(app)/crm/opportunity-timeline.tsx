"use client";

import { useT } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import { addOpportunityNoteAction } from "./actions";

export interface TimelineEntry {
  id: string;
  type: string;
  body: string | null;
  authorName: string | null;
  createdAt: string; // ISO
}

const DOT: Record<string, string> = {
  NOTE: "#6d5efc",
  CREATED: "#10b981",
  STAGE_CHANGED: "#3b82f6",
  OUTCOME_CHANGED: "#f59e0b",
  UPDATED: "#6b7280",
  EMAIL: "#06b6d4",
};

export function OpportunityTimeline({ opportunityId, entries }: { opportunityId: string; entries: TimelineEntry[] }) {
  const t = useT();

  function label(e: TimelineEntry): string {
    switch (e.type) {
      case "CREATED": return t.crm.tlCreated;
      case "STAGE_CHANGED": return `${t.crm.tlStageChanged}${e.body ? `: ${e.body}` : ""}`;
      case "OUTCOME_CHANGED": {
        const o = e.body === "WON" ? t.crm.outcomeWon : e.body === "LOST" ? t.crm.outcomeLost : t.crm.outcomeOpen;
        return `${t.crm.tlOutcomeChanged}: ${o}`;
      }
      case "UPDATED": return t.crm.tlUpdated;
      case "EMAIL": return `${t.crm.tlEmailed}${e.body ? `: ${e.body}` : ""}`;
      default: return e.body ?? "";
    }
  }

  return (
    <div className="space-y-4">
      <form action={addOpportunityNoteAction} className="space-y-2">
        <input type="hidden" name="id" value={opportunityId} />
        <textarea
          name="body"
          rows={2}
          required
          placeholder={t.crm.notePlaceholder}
          className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        />
        <Button type="submit" size="sm">{t.crm.addNote}</Button>
      </form>

      {entries.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">{t.crm.noActivity}</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => (
            <li key={e.id} className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: DOT[e.type] ?? "#6b7280" }} />
              <div className="min-w-0 flex-1">
                {e.type === "NOTE" ? (
                  <p className="whitespace-pre-wrap text-sm">{e.body}</p>
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)]">{label(e)}</p>
                )}
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  {e.authorName ?? "System"} · {new Date(e.createdAt).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
