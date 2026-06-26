import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { isContractsEnabled } from "@/lib/settings/service";
import { listContracts, getContractStats } from "@/lib/contracts/queries";
import { listClients } from "@/lib/clients/queries";
import { listContractTypes, listContractStatuses } from "@/lib/taxonomies/queries";
import { formatContractReference, formatMoneyCents, billingCycleLabel } from "@/lib/contracts/meta";
import { formatMinutes } from "@/lib/timesheets/meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContractBadge } from "@/components/contracts/badges";
import { ContractsFilters } from "./contracts-filters";

type SP = { clientId?: string; typeId?: string; statusId?: string };

export default async function ContractsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePermission("contracts.read");
  if (!(await isContractsEnabled())) notFound();
  const sp = await searchParams;

  const [contracts, stats, clients, types, statuses] = await Promise.all([
    listContracts({ clientId: sp.clientId, typeId: sp.typeId, statusId: sp.statusId }),
    getContractStats(),
    listClients({}),
    listContractTypes({ activeOnly: true }),
    listContractStatuses({ activeOnly: true }),
  ]);

  const kpis = [
    { label: "Contracts", value: String(stats.total), color: "#6d5efc" },
    { label: "Monthly recurring", value: formatMoneyCents(stats.monthlyRecurringCents), color: "#10b981" },
    { label: "Total value", value: formatMoneyCents(stats.totalValueCents), color: "#3b82f6" },
    { label: "Expiring (30d)", value: String(stats.expiringSoon), color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Contracts" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Contracts</h1>
        <div className="flex items-center gap-2">
          <a href="/api/export?type=contracts" download><Button variant="outline">Export CSV</Button></a>
          {can(user, "contracts.manage") ? (
            <Link href="/contracts/new"><Button>New contract</Button></Link>
          ) : null}
        </div>
      </div>

      <StatGrid>
        {kpis.map((k) => (
          <StatCard key={k.label} label={k.label} value={k.value} color={k.color} />
        ))}
      </StatGrid>

      <ContractsFilters
        clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
        types={types.map((t) => ({ id: t.id, name: t.name }))}
        statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
      />

      <Card>
        {contracts.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">No contracts found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Ref</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Client</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Type</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Status</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Value</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Quota</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Period</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/40">
                  <td className="px-4 py-3">
                    <Link href={`/contracts/${c.id}/edit`} className="inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs hover:underline">
                      {formatContractReference(c.number)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/clients/${c.client.id}`} className="font-medium hover:underline">{c.client.companyName}</Link>
                    {c.name ? <span className="block text-xs text-[var(--muted-foreground)]">{c.name}</span> : null}
                  </td>
                  <td className="px-4 py-3"><ContractBadge name={c.type.name} color={c.type.color} /></td>
                  <td className="px-4 py-3"><ContractBadge name={c.status.name} color={c.status.color} /></td>
                  <td className="px-4 py-3 whitespace-nowrap text-[var(--muted-foreground)]">
                    {formatMoneyCents(c.valueCents)}
                    <span className="text-xs"> / {billingCycleLabel(c.billingCycle).toLowerCase()}</span>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] whitespace-nowrap">
                    {c.includedMinutesPerPeriod != null ? formatMinutes(c.includedMinutesPerPeriod) : "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] whitespace-nowrap">
                    {new Date(c.startDate).toLocaleDateString()}
                    {c.endDate ? ` → ${new Date(c.endDate).toLocaleDateString()}` : ""}
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
