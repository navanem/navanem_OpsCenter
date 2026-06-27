import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isCrmEnabled } from "@/lib/settings/service";
import { getCrmAnalytics } from "@/lib/crm/queries";
import { formatMoneyCents } from "@/lib/crm/meta";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { CrmTabs } from "../crm-tabs";

export default async function CrmAnalyticsPage() {
  await requirePermission("crm.read");
  if (!(await isCrmEnabled())) notFound();
  const [a, dict] = await Promise.all([getCrmAnalytics(), getDictionary()]);
  const t = dict.crm;

  const maxStageCount = Math.max(1, ...a.byStage.map((s) => s.count));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.crm, href: "/crm" }, { label: t.analytics }]} />
      <h1 className="text-2xl font-semibold tracking-tight">{dict.nav.crm}</h1>

      <CrmTabs />

      <StatGrid>
        <StatCard label={t.winRate} value={`${Math.round(a.winRate * 100)}%`} color="#10b981" hint={`${a.wonCount} ${t.outcomeWon.toLowerCase()} · ${a.lostCount} ${t.outcomeLost.toLowerCase()}`} />
        <StatCard label={t.avgDealSize} value={formatMoneyCents(a.avgWonDealCents)} color="#6d5efc" />
        <StatCard label={t.avgSalesCycle} value={`${a.avgSalesCycleDays} ${t.days}`} color="#3b82f6" />
        <StatCard label={t.wonRevenue} value={formatMoneyCents(a.wonValueCents)} color="#06b6d4" />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle>{t.pipelineByStage}</CardTitle>
        </CardHeader>
        <CardContent>
          {a.byStage.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">{t.noOpportunities}</p>
          ) : (
            <div className="space-y-3">
              {a.byStage.map((s) => (
                <div key={s.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.name || dict.common.none}
                    </span>
                    <span className="tabular-nums text-[var(--muted-foreground)]">
                      {s.count} · {formatMoneyCents(s.valueCents)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--muted)]">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${(s.count / maxStageCount) * 100}%`, backgroundColor: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
