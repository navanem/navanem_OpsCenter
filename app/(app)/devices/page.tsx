import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { isDevicesEnabled } from "@/lib/settings/service";
import { listDevices, getDeviceStats } from "@/lib/devices/queries";
import { listClients } from "@/lib/clients/queries";
import { listDeviceTypes, listDeviceStatuses } from "@/lib/taxonomies/queries";
import { formatDeviceReference, isWarrantyExpiringSoon, isWarrantyExpired } from "@/lib/devices/meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { DeviceBadge } from "@/components/devices/badges";
import { getDictionary } from "@/lib/i18n/server";
import { DevicesFilters } from "./devices-filters";

type SP = { search?: string; clientId?: string; typeId?: string; statusId?: string };

export default async function DevicesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePermission("devices.read");
  if (!(await isDevicesEnabled())) notFound();
  const [sp, dict] = await Promise.all([searchParams, getDictionary()]);

  const [devices, stats, clients, types, statuses] = await Promise.all([
    listDevices({ search: sp.search, clientId: sp.clientId, typeId: sp.typeId, statusId: sp.statusId }),
    getDeviceStats(),
    listClients({}),
    listDeviceTypes({ activeOnly: true }),
    listDeviceStatuses({ activeOnly: true }),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.devices }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{dict.nav.devices}</h1>
        <div className="flex items-center gap-2">
          <a href="/api/export?type=devices" download><Button variant="outline">{dict.common.exportCsv}</Button></a>
          {can(user, "devices.manage") ? <Link href="/devices/new"><Button>{dict.devices.new}</Button></Link> : null}
        </div>
      </div>

      <StatGrid>
        <StatCard label={dict.devices.kpiTotal} value={stats.total} color="#6d5efc" />
        <StatCard label={dict.devices.kpiAssigned} value={stats.assigned} color="#10b981" />
        <StatCard label={dict.devices.kpiUnassigned} value={stats.unassigned} color="#3b82f6" />
        <StatCard label={dict.devices.kpiWarranty} value={stats.warrantySoon} color="#f59e0b" />
      </StatGrid>

      <DevicesFilters
        clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
        types={types.map((t) => ({ id: t.id, name: t.name }))}
        statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
      />

      <Card>
        {devices.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">{dict.devices.noneFound}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.ref}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.name}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.type}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.status}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.client}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.serial}</th>
                <th scope="col" className="px-4 py-3 text-xs font-medium uppercase tracking-wide">{dict.common.warranty}</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/40">
                  <td className="px-4 py-3">
                    <Link href={`/devices/${d.id}/edit`} className="inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs hover:underline">
                      {formatDeviceReference(d.number)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3"><DeviceBadge name={d.type.name} color={d.type.color} /></td>
                  <td className="px-4 py-3"><DeviceBadge name={d.status.name} color={d.status.color} /></td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{d.client?.companyName ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted-foreground)]">{d.serialNumber ?? "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[var(--muted-foreground)]">
                    {d.warrantyExpiry ? (
                      <span className={isWarrantyExpired(d.warrantyExpiry) ? "text-[#ef4444]" : isWarrantyExpiringSoon(d.warrantyExpiry) ? "text-[#f59e0b]" : ""}>
                        {new Date(d.warrantyExpiry).toLocaleDateString()}
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
