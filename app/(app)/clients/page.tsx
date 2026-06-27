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
import { getDictionary } from "@/lib/i18n/server";
import { ClientsFilters } from "./clients-filters";

const AVATAR_COLORS = ["#6d5efc", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];

function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; technicianId?: string }>;
}) {
  const user = await requirePermission("clients.read");
  const [sp, dict] = await Promise.all([searchParams, getDictionary()]);
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
      <Breadcrumbs items={[{ label: dict.nav.clients }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{dict.nav.clients}</h1>
        <div className="flex items-center gap-2">
          <a href="/api/export?type=clients" download>
            <Button variant="outline">{dict.common.exportCsv}</Button>
          </a>
          {can(user, "clients.manage") ? (
            <>
              <Link href="/clients/import">
                <Button variant="outline">{dict.common.importCsv}</Button>
              </Link>
              <Link href="/clients/new">
                <Button>{dict.clients.new}</Button>
              </Link>
            </>
          ) : null}
        </div>
      </div>

      <StatGrid>
        <StatCard label={dict.clients.kpiClients} value={stats.total} color="#6d5efc" />
        <StatCard label={dict.clients.kpiActive} value={stats.active} color="#10b981" />
        <StatCard label={dict.clients.kpiUnassigned} value={stats.unassigned} color="#f59e0b" />
        {canReadTickets ? (
          <StatCard label={dict.clients.kpiOpenTickets} value={Object.values(openCounts).reduce((a, b) => a + b, 0)} color="#3b82f6" />
        ) : (
          <StatCard label={dict.clients.kpiInactive} value={stats.total - stats.active} color="#6b7280" />
        )}
        {showMrr ? <StatCard label={dict.clients.kpiMrr} value={formatMoneyCents(totalMrrCents)} color="#8b5cf6" /> : null}
      </StatGrid>

      <ClientsFilters technicians={technicians} />

      <Card className="overflow-hidden p-0">
        {clients.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">{dict.clients.noneFound}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-left text-[11px] uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="px-6 py-3 font-semibold">{dict.common.client}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{dict.common.technician}</th>
                {canReadTickets ? <th scope="col" className="px-4 py-3 font-semibold">{dict.clients.colTickets}</th> : null}
                {showDevices ? <th scope="col" className="px-4 py-3 font-semibold">{dict.nav.devices}</th> : null}
                {showMrr ? <th scope="col" className="px-4 py-3 text-right font-semibold">{dict.clients.kpiMrr}</th> : null}
                <th scope="col" className="px-4 py-3 font-semibold">{dict.common.status}</th>
                <th scope="col" className="px-6 py-3 text-right font-semibold">{dict.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const active = c.status === "ACTIVE";
                return (
                  <tr key={c.id} className="border-b border-[var(--border)] transition-colors last:border-0 hover:bg-[var(--muted)]/40">
                    <td className="px-6 py-3">
                      <Link href={`/clients/${c.id}`} className="flex items-center gap-3 group">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: avatarColor(c.companyName) }}
                          aria-hidden
                        >
                          {initials(c.companyName)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-[var(--foreground)] group-hover:underline">{c.companyName}</span>
                          <span className="block truncate text-xs text-[var(--muted-foreground)]">{c.domain ?? "—"}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted-foreground)]">
                      {c.assignedTechnician ? `${c.assignedTechnician.firstName} ${c.assignedTechnician.lastName}` : dict.common.unassigned}
                    </td>
                    {canReadTickets ? (
                      <td className="px-4 py-3">
                        {openCounts[c.id] ? (
                          <span className="inline-flex items-center rounded-full bg-[#3b82f622] px-2 py-0.5 text-xs font-medium text-[#3b82f6]">{openCounts[c.id]}</span>
                        ) : (
                          <span className="text-[var(--muted-foreground)]">—</span>
                        )}
                      </td>
                    ) : null}
                    {showDevices ? (
                      <td className="px-4 py-3">
                        {deviceCounts[c.id] ? (
                          <span className="inline-flex items-center rounded-full bg-[#6d5efc22] px-2 py-0.5 text-xs font-medium text-[#6d5efc]">{deviceCounts[c.id]}</span>
                        ) : (
                          <span className="text-[var(--muted-foreground)]">—</span>
                        )}
                      </td>
                    ) : null}
                    {showMrr ? (
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--muted-foreground)]">
                        {mrrCents[c.id] ? formatMoneyCents(mrrCents[c.id]) : "—"}
                      </td>
                    ) : null}
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={
                          active
                            ? { backgroundColor: "#10b98122", color: "#10b981" }
                            : { backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }
                        }
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: active ? "#10b981" : "var(--muted-foreground)" }} />
                        {active ? dict.common.active : dict.common.inactive}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/clients/${c.id}`} title="View" aria-label="View" className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]">
                          <EyeIcon />
                        </Link>
                        {can(user, "clients.manage") ? (
                          <Link href={`/clients/${c.id}/edit`} title="Edit" aria-label="Edit" className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]">
                            <PencilIcon />
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
