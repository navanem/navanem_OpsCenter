import "server-only";
import { headers } from "next/headers";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";

export interface AuditEntry {
  action: string; // "created" | "updated" | "deleted" | "status_changed" | ...
  entityType: string; // "ticket" | "client" | "device" | ...
  entityId?: string | null;
  entityLabel?: string | null; // human label, e.g. "TKT-1042" or a company name
  summary: string; // human-readable sentence
  metadata?: Record<string, unknown>;
  // Optionally attribute to a known actor (e.g. a portal contact) instead of the staff user.
  actorId?: string | null;
  actorName?: string | null;
}

// Records an audit-log entry. Best-effort: any failure is swallowed so it can
// never break the action that triggered it.
export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    let actorId = entry.actorId ?? null;
    let actorName = entry.actorName ?? null;
    if (actorName === null) {
      const user = await getCurrentUser();
      actorId = user?.id ?? null;
      actorName = user ? `${user.firstName} ${user.lastName}` : "System";
    }
    let ipAddress: string | null = null;
    try {
      const h = await headers();
      ipAddress = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
    } catch {
      /* headers() not available in this context */
    }
    await prisma.auditLog.create({
      data: {
        actorId,
        actorName: actorName ?? "System",
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        entityLabel: entry.entityLabel ?? null,
        summary: entry.summary,
        metadata: entry.metadata ? (entry.metadata as Prisma.InputJsonValue) : undefined,
        ipAddress,
      },
    });
  } catch {
    /* never let audit logging break the underlying action */
  }
}
