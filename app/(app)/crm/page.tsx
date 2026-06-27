import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { isCrmEnabled } from "@/lib/settings/service";
import { listOpportunities, getCrmStats } from "@/lib/crm/queries";
import { listClients } from "@/lib/clients/queries";
import { listOpportunityStages } from "@/lib/taxonomies/queries";
import { formatOpportunityReference, formatMoneyCents } from "@/lib/crm/meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { CrmTabs } from "./crm-tabs";
import { CrmFilters } from "./crm-filters";
import { PipelineBoard } from "./pipeline-board";

type SP = { search?: string; clientId?: string; stageId?: string; outcome?: string; view?: string };

function Badge({ name, color }: { name: string; color: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${color}22`, color }}>{name}</span>
  );
}

function OutcomePill({ outcome, dict }: { outcome: string; dict: Awaited<ReturnType<typeof getDictionary>> }) {
  const map: Record<string, { label: string; color: string }> = {
    OPEN: { label: dict.crm.outcomeOpen, color: "#3b82f6" },
    WON: { label: dict.crm.outcomeWon, color: "#10b981" },
    LOST: { label: dict.crm.outcomeLost, color: "#ef4444" },
  };
  const o = map[outcome] ?? map.OPEN;
  return <Badge name={o.label} color={o.color} />;
}

export default async function CrmPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePermission("crm.read");
  if (!(await isCrmEnabled())) notFound();
  const [sp, dict] = await Promise.all([searchParams, getDictionary()]);

  const [opportunities, stats, clients, stages] = await Promise.all([
    listOpportunities({ search: sp.search, clientId: sp.clientId, stageId: sp.stageId, outcome: sp.outcome }),
    getCrmStats(),
    listClients({}),
    listOpportunityStages({ activeOnly: true }),
  ]);

  const view = sp.view === "list" ? "list" : "board";
  const now = Date.now();
  const isOverdue = (d: Date | null) => d != null && new Date(d).getTime() < now;
  // Preserve active filters when switching between board and list.
  const baseParams = new URLSearchParams();
  if (sp.search) baseParams.set("search", sp.search);
  if (sp.clientId) baseParams.set("clientId", sp.clientId);
  if (sp.stageId) baseParams.set("stageId", sp.stageId);
  if (sp.outcome) baseParams.set("outcome", sp.outcome);
  const toView = (v: string) => {
    const p = new URLSearchParams(baseParams);
    p.set("view", v);
    return `/crm?${p.toString()}`;
  };
  const toggleClass = (active: boolean) =>
    "rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium transition " +
    (active ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]");

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.crm }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{dict.nav.crm}</h1>
        {can(user, "crm.manage") ? <Link href="/crm/new"><Button>{dict.crm.newOpportunity}</Button></Link> : null}
      </div>

      <StatGrid>
        <StatCard label={dict.crm.kpiOpen} value={stats.openCount} color="#3b82f6" hint={stats.overdueCount > 0 ? `${stats.overdueCount} ${dict.crm.overdue.toLowerCase()}` : undefined} />
        <StatCard label={dict.crm.kpiPipelineValue} value={formatMoneyCents(stats.openValueCents)} color="#6d5efc" hint={`${dict.crm.weightedForecast}: ${formatMoneyCents(stats.weightedForecastCents)}`} />
        <StatCard label={dict.crm.kpiWon} value={stats.wonCount} color="#10b981" />
        <StatCard label={dict.crm.kpiLeads} value={stats.leadCount} color="#f59e0b" />
      </StatGrid>

      <CrmTabs />

      <div className="flex items-center justify-between gap-3">
        <CrmFilters
          clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
          stages={stages.map((s) => ({ id: s.id, name: s.name }))}
        />
        <div className="flex shrink-0 items-center gap-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] p-1">
          <Link href={toView("board")} className={toggleClass(view === "board")}>{dict.crm.board}</Link>
          <Link href={toView("list")} className={toggleClass(view === "list")}>{dict.crm.list}</Link>
        </div>
      </div>

      {view === "board" ? (
        <PipelineBoard
          canManage={can(user, "crm.manage")}
          stages={stages.map((s) => ({ id: s.id, name: s.name, color: s.color }))}
          initial={opportunities.map((o) => ({
            id: o.id,
            number: o.number,
            name: o.name,
            stageId: o.stageId,
            clientName: o.client?.companyName ?? null,
            ownerName: o.owner ? `${o.owner.firstName} ${o.owner.lastName}` : null,
            valueCents: o.valueCents,
            outcome: o.outcome,
            overdue: isOverdue(o.expectedCloseAt),
          }))}
        />
      ) : (
      <Card>
        {opportunities.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">{dict.crm.noOpportunities}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.ref}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.name}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.client}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.crm.stage}</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide">{dict.crm.value}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.crm.outcome}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.crm.expectedClose}</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((o) => (
                <tr key={o.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/40">
                  <td className="px-4 py-3">
                    <Link href={`/crm/${o.id}/edit`} className="inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs hover:underline">{formatOpportunityReference(o.number)}</Link>
                  </td>
                  <td className="px-4 py-3 font-medium">{o.name}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{o.client?.companyName ?? "—"}</td>
                  <td className="px-4 py-3">{o.stage ? <Badge name={o.stage.name} color={o.stage.color} /> : <span className="text-[var(--muted-foreground)]">—</span>}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatMoneyCents(o.valueCents)}</td>
                  <td className="px-4 py-3"><OutcomePill outcome={o.outcome} dict={dict} /></td>
                  <td className={"px-4 py-3 whitespace-nowrap " + (isOverdue(o.expectedCloseAt) && o.outcome === "OPEN" ? "font-medium text-[#ef4444]" : "text-[var(--muted-foreground)]")}>{o.expectedCloseAt ? new Date(o.expectedCloseAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      )}
    </div>
  );
}
