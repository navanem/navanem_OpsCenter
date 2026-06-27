import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { isSubscriptionsEnabled } from "@/lib/settings/service";
import { listSubscriptions, getSubscriptionStats } from "@/lib/subscriptions/queries";
import { listClients } from "@/lib/clients/queries";
import { listSubscriptionTypes, listSubscriptionStatuses } from "@/lib/taxonomies/queries";
import { formatSubscriptionReference, isRenewalDueSoon, isRenewalOverdue } from "@/lib/subscriptions/meta";
import { formatMoneyCents } from "@/lib/contracts/meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { SubscriptionsFilters } from "./subscriptions-filters";

type SP = { search?: string; clientId?: string; typeId?: string; statusId?: string };

function Badge({ name, color }: { name: string; color: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${color}22`, color }}>
      {name}
    </span>
  );
}

export default async function SubscriptionsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePermission("subscriptions.read");
  if (!(await isSubscriptionsEnabled())) notFound();
  const [sp, dict] = await Promise.all([searchParams, getDictionary()]);

  const [subs, stats, clients, types, statuses] = await Promise.all([
    listSubscriptions({ search: sp.search, clientId: sp.clientId, typeId: sp.typeId, statusId: sp.statusId }),
    getSubscriptionStats(),
    listClients({}),
    listSubscriptionTypes({ activeOnly: true }),
    listSubscriptionStatuses({ activeOnly: true }),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.subscriptions }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{dict.nav.subscriptions}</h1>
        {can(user, "subscriptions.manage") ? <Link href="/subscriptions/new"><Button>{dict.subscriptions.new}</Button></Link> : null}
      </div>

      <StatGrid>
        <StatCard label={dict.subscriptions.kpiCount} value={stats.total} color="#6d5efc" />
        <StatCard label={dict.subscriptions.kpiMrr} value={formatMoneyCents(stats.monthlyRecurringCents)} color="#10b981" />
        <StatCard label={dict.subscriptions.kpiRenewing} value={stats.renewingSoon} color="#f59e0b" />
        <StatCard label={dict.subscriptions.kpiAssigned} value={stats.assigned} color="#3b82f6" />
      </StatGrid>

      <SubscriptionsFilters
        clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
        types={types.map((t) => ({ id: t.id, name: t.name }))}
        statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
      />

      <Card>
        {subs.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">{dict.subscriptions.noneFound}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.ref}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.name}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.type}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.status}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.client}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.cost}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.renewal}</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/40">
                  <td className="px-4 py-3">
                    <Link href={`/subscriptions/${s.id}/edit`} className="inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs hover:underline">
                      {formatSubscriptionReference(s.number)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium">{s.name}{s.provider ? <span className="ml-1 text-xs text-[var(--muted-foreground)]">· {s.provider}</span> : null}</td>
                  <td className="px-4 py-3"><Badge name={s.type.name} color={s.type.color} /></td>
                  <td className="px-4 py-3"><Badge name={s.status.name} color={s.status.color} /></td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{s.client?.companyName ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums text-[var(--muted-foreground)]">{s.costCents != null ? formatMoneyCents(s.costCents) : "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[var(--muted-foreground)]">
                    {s.renewalDate ? (
                      <span className={isRenewalOverdue(s.renewalDate) ? "text-[#ef4444]" : isRenewalDueSoon(s.renewalDate) ? "text-[#f59e0b]" : ""}>
                        {new Date(s.renewalDate).toLocaleDateString()}
                      </span>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
