import { requirePermission } from "@/lib/auth/guard";
import { listAuditLogs, countAuditLogs, auditFacets } from "@/lib/audit/queries";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { AuditFilters } from "./audit-filters";

const PAGE_SIZE = 50;

type SP = { search?: string; entityType?: string; action?: string; page?: string };

const ACTION_COLORS: Record<string, string> = {
  created: "#10b981",
  updated: "#3b82f6",
  deleted: "#ef4444",
  status_changed: "#8b5cf6",
  assigned: "#f59e0b",
};

export default async function AuditPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requirePermission("audit.read");
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const filters = { search: sp.search, entityType: sp.entityType, action: sp.action };

  const [logs, total, facets] = await Promise.all([
    listAuditLogs({ ...filters, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    countAuditLogs(filters),
    auditFacets(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const qs = (p: number) => {
    const params = new URLSearchParams();
    if (sp.search) params.set("search", sp.search);
    if (sp.entityType) params.set("entityType", sp.entityType);
    if (sp.action) params.set("action", sp.action);
    params.set("page", String(p));
    return `/settings/audit?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Audit log" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Audit log</h1>
        <span className="text-sm text-[var(--muted-foreground)]">{total} entries</span>
      </div>

      <AuditFilters types={facets.types} actions={facets.actions} />

      <Card className="overflow-hidden p-0">
        {logs.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">No activity recorded yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-left text-[11px] uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="px-4 py-3 font-semibold">When</th>
                <th scope="col" className="px-4 py-3 font-semibold">Who</th>
                <th scope="col" className="px-4 py-3 font-semibold">Action</th>
                <th scope="col" className="px-4 py-3 font-semibold">Entity</th>
                <th scope="col" className="px-4 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => {
                const color = ACTION_COLORS[l.action] ?? "#6b7280";
                return (
                  <tr key={l.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30">
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-[var(--muted-foreground)]">{new Date(l.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{l.actorName}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${color}22`, color }}>
                        {l.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-[var(--muted-foreground)]">
                      <span className="font-medium text-[var(--foreground)]">{l.entityType}</span>
                      {l.entityLabel ? <span className="ml-1 font-mono text-xs">{l.entityLabel}</span> : null}
                    </td>
                    <td className="px-4 py-2.5 text-[var(--muted-foreground)]">{l.summary}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {pages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <a href={qs(Math.max(1, page - 1))} className={`rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 ${page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-[var(--muted)]"}`}>‹ Previous</a>
          <span className="text-[var(--muted-foreground)]">Page {page} / {pages}</span>
          <a href={qs(Math.min(pages, page + 1))} className={`rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 ${page >= pages ? "pointer-events-none opacity-40" : "hover:bg-[var(--muted)]"}`}>Next ›</a>
        </div>
      ) : null}
    </div>
  );
}
