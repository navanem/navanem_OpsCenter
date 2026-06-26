import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import {
  listClients,
  getClientStats,
  getClientOpenTicketCounts,
  getClientMrrCents,
  getClientDeviceCounts,
} from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { isContractsEnabled, isDevicesEnabled } from "@/lib/settings/service";
import { formatMoneyCents } from "@/lib/contracts/meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ClientsFilters } from "./clients-filters";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; technicianId?: string }>;
}) {
  const user = await requirePermission("clients.read");
  const sp = await searchParams;
  const status = sp.status === "ACTIVE" || sp.status === "INACTIVE" ? sp.status : undefined;

  const canReadTickets = can(user, "tickets.read");
  const [contractsEnabled, devicesEnabled] = await Promise.all([isContractsEnabled(), isDevicesEnabled()]);
  const showMrr = contractsEnabled && can(user, "contracts.read");
  const showDevices = devicesEnabled && can(user, "devices.read");
  const empty = Promise.resolve({} as Record<string, number>);
  const [clients, technicians, stats, openCounts, mrrCents, deviceCounts] = await Promise.all([
    listClients({ search: sp.search, status, technicianId: sp.technicianId }),
    listTechnicians(),
    getClientStats(),
    canReadTickets ? getClientOpenTicketCounts() : empty,
    showMrr ? getClientMrrCents() : empty,
    showDevices ? getClientDeviceCounts() : empty,
  ]);
  const totalMrrCents = Object.values(mrrCents).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Clients" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
        <div className="flex items-center gap-2">
          <a href="/api/export?type=clients" download>
            <Button variant="outline">Export CSV</Button>
          </a>
          {can(user, "clients.manage") ? (
            <>
              <Link href="/clients/import">
                <Button variant="outline">Import CSV</Button>
              </Link>
              <Link href="/clients/new">
                <Button>New client</Button>
              </Link>
            </>
          ) : null}
        </div>
      </div>

      <StatGrid>
        <StatCard label="Clients" value={stats.total} color="#6d5efc" />
        <StatCard label="Active" value={stats.active} color="#10b981" />
        <StatCard label="Unassigned" value={stats.unassigned} color="#f59e0b" />
        {canReadTickets ? (
          <StatCard label="Open tickets" value={Object.values(openCounts).reduce((a, b) => a + b, 0)} color="#3b82f6" />
        ) : (
          <StatCard label="Inactive" value={stats.total - stats.active} color="#6b7280" />
        )}
        {showMrr ? <StatCard label="MRR" value={formatMoneyCents(totalMrrCents)} color="#8b5cf6" /> : null}
      </StatGrid>

      <ClientsFilters technicians={technicians} />

      <Card>
        {clients.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">No clients found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-6 py-3 font-medium">Company</th>
                <th scope="col" className="px-6 py-3 font-medium">Domain</th>
                <th scope="col" className="px-6 py-3 font-medium">Technician</th>
                {canReadTickets ? <th scope="col" className="px-6 py-3 font-medium">Open tickets</th> : null}
                {showDevices ? <th scope="col" className="px-6 py-3 font-medium">Devices</th> : null}
                {showMrr ? <th scope="col" className="px-6 py-3 font-medium">MRR</th> : null}
                <th scope="col" className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-6 py-3">
                    <Link href={`/clients/${c.id}`} className="hover:underline">
                      {c.companyName}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-[var(--muted-foreground)]">{c.domain ?? "—"}</td>
                  <td className="px-6 py-3 text-[var(--muted-foreground)]">
                    {c.assignedTechnician
                      ? `${c.assignedTechnician.firstName} ${c.assignedTechnician.lastName}`
                      : "Unassigned"}
                  </td>
                  {canReadTickets ? (
                    <td className="px-6 py-3">
                      {openCounts[c.id] ? (
                        <span className="inline-flex items-center rounded-full bg-[#3b82f622] px-2 py-0.5 text-xs font-medium text-[#3b82f6]">
                          {openCounts[c.id]}
                        </span>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">—</span>
                      )}
                    </td>
                  ) : null}
                  {showDevices ? (
                    <td className="px-6 py-3">
                      {deviceCounts[c.id] ? (
                        <span className="inline-flex items-center rounded-full bg-[#6d5efc22] px-2 py-0.5 text-xs font-medium text-[#6d5efc]">
                          {deviceCounts[c.id]}
                        </span>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">—</span>
                      )}
                    </td>
                  ) : null}
                  {showMrr ? (
                    <td className="px-6 py-3 text-[var(--muted-foreground)] tabular-nums">
                      {mrrCents[c.id] ? formatMoneyCents(mrrCents[c.id]) : "—"}
                    </td>
                  ) : null}
                  <td className="px-6 py-3">
                    <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs">
                      {c.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
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
