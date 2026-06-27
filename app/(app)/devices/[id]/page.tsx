import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { isDevicesEnabled } from "@/lib/settings/service";
import { getDevice, listDeviceTickets } from "@/lib/devices/queries";
import { formatDeviceReference } from "@/lib/devices/meta";
import { isDeviceOnline, mbToHuman, pct, buildWindowsAgent, buildUnixAgent } from "@/lib/devices/agent";
import { formatTicketReference, TICKET_STATUS_META, type TicketStatusKey } from "@/lib/tickets/meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { DeviceBadge } from "@/components/devices/badges";
import { AgentPanel } from "./agent-panel";
import { generateDeviceTokenAction, revokeDeviceTokenAction } from "../actions";

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--border)] p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
      {sub ? <p className="text-xs text-[var(--muted-foreground)]">{sub}</p> : null}
    </div>
  );
}

function UsageBar({ label, percent, detail }: { label: string; percent: number | null; detail: string }) {
  const p = percent ?? 0;
  const color = p > 90 ? "#ef4444" : p > 75 ? "#f59e0b" : "#10b981";
  return (
    <div className="rounded-[var(--radius)] border border-[var(--border)] p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">{label}</span>
        <span className="text-sm font-semibold tabular-nums">{percent != null ? `${percent}%` : "—"}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[var(--muted)]">
        <div className="h-2 rounded-full transition-all" style={{ width: `${p}%`, backgroundColor: color }} />
      </div>
      <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">{detail}</p>
    </div>
  );
}

export default async function DeviceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("devices.read");
  if (!(await isDevicesEnabled())) notFound();
  const { id } = await params;
  const canReadTickets = can(user, "tickets.read");
  const [device, tickets, h] = await Promise.all([
    getDevice(id),
    canReadTickets ? listDeviceTickets(id) : Promise.resolve([]),
    headers(),
  ]);
  if (!device) notFound();

  const canManage = can(user, "devices.manage");
  const ref = formatDeviceReference(device.number);
  const online = isDeviceOnline(device.lastSeenAt);

  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const reportUrl = `${process.env.APP_URL ?? `${proto}://${host}`}/api/agent/report`;

  const ramPct = pct(device.ramUsedMb, device.ramTotalMb);
  const diskPct = pct(device.diskUsedMb, device.diskTotalMb);
  const cpuPct = device.cpuUsagePct != null ? Math.round(device.cpuUsagePct) : null;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Devices", href: "/devices" }, { label: ref }]} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{device.name}</h1>
            <span className="font-mono text-base text-[var(--muted-foreground)]">{ref}</span>
            <DeviceBadge name={device.type.name} color={device.type.color} />
            <DeviceBadge name={device.status.name} color={device.status.color} />
          </div>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {device.client ? device.client.companyName : "Internal"}
            {device.hostname ? ` · ${device.hostname}` : ""}
            {device.ipAddress ? ` · ${device.ipAddress}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canReadTickets && device.clientId && can(user, "tickets.manage") ? (
            <Link href={`/tickets/new?clientId=${device.clientId}&deviceId=${device.id}`}><Button variant="outline" size="sm">New ticket</Button></Link>
          ) : null}
          {canManage ? <Link href={`/devices/${device.id}/edit`}><Button variant="outline" size="sm">Edit</Button></Link> : null}
        </div>
      </div>

      {/* Live status banner */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border px-5 py-4"
        style={online ? { borderColor: "#10b98155", backgroundColor: "#10b9811a" } : { borderColor: "#ef444455", backgroundColor: "#ef44441a" }}
      >
        <span className="flex items-center gap-2 font-semibold" style={{ color: online ? "#10b981" : "#ef4444" }}>
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: online ? "#10b981" : "#ef4444" }} />
          {online ? "Online" : device.lastSeenAt ? "Offline" : "Agent not reporting"}
        </span>
        <span className="text-sm text-[var(--muted-foreground)]">
          {device.lastSeenAt ? `Last seen ${new Date(device.lastSeenAt).toLocaleString()}` : "No data received yet"}
          {device.agentVersion ? ` · agent v${device.agentVersion}` : ""}
        </span>
      </div>

      {/* System info */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="OS" value={device.osName ?? "—"} sub={device.osVersion ?? undefined} />
        <Metric label="CPU" value={device.cpuModel ?? "—"} sub={device.cpuLogical != null ? `${device.cpuPhysical ?? "?"} cores · ${device.cpuLogical} threads${device.cpuFreqMhz ? ` · ${(device.cpuFreqMhz / 1000).toFixed(1)} GHz` : ""}` : undefined} />
        <Metric label="Memory" value={mbToHuman(device.ramTotalMb)} sub={device.ramUsedMb != null ? `${mbToHuman(device.ramUsedMb)} used` : undefined} />
        <Metric label="Disk (C:)" value={mbToHuman(device.diskTotalMb)} sub={device.diskUsedMb != null ? `${mbToHuman(device.diskUsedMb)} used` : undefined} />
      </div>

      {/* Usage */}
      <div className="grid gap-3 sm:grid-cols-3">
        <UsageBar label="CPU usage" percent={cpuPct} detail={device.cpuFreqMhz ? `${(device.cpuFreqMhz / 1000).toFixed(1)} GHz` : "—"} />
        <UsageBar label="Memory usage" percent={ramPct} detail={`${mbToHuman(device.ramUsedMb)} / ${mbToHuman(device.ramTotalMb)}`} />
        <UsageBar label="Disk usage" percent={diskPct} detail={`${mbToHuman(device.diskUsedMb)} / ${mbToHuman(device.diskTotalMb)}`} />
      </div>

      {/* Monitoring agent */}
      {canManage ? (
        <Card>
          <CardHeader>
            <CardTitle>Monitoring agent</CardTitle>
          </CardHeader>
          <CardContent>
            {device.agentToken ? (
              <div className="space-y-4">
                <AgentPanel
                  token={device.agentToken}
                  reportUrl={reportUrl}
                  windows={buildWindowsAgent(device.agentToken, reportUrl)}
                  unix={buildUnixAgent(device.agentToken, reportUrl)}
                />
                <form action={revokeDeviceTokenAction}>
                  <input type="hidden" name="id" value={device.id} />
                  <Button type="submit" variant="outline" size="sm" className="text-[var(--destructive)]">Revoke token</Button>
                </form>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <p className="text-[var(--muted-foreground)]">
                  Generate a token, then deploy the agent on this workstation to capture CPU, memory, disk, OS and uptime automatically.
                </p>
                <form action={generateDeviceTokenAction}>
                  <input type="hidden" name="id" value={device.id} />
                  <Button type="submit">Generate agent token</Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Related tickets */}
      {canReadTickets ? (
        <Card>
          <CardHeader>
            <CardTitle>Related tickets <span className="text-sm font-normal text-[var(--muted-foreground)]">({tickets.length})</span></CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {tickets.length === 0 ? (
              <p className="text-[var(--muted-foreground)]">No tickets linked to this device.</p>
            ) : (
              <div>
                {tickets.map((t) => {
                  const m = TICKET_STATUS_META[t.status as TicketStatusKey];
                  return (
                    <div key={t.id} className="flex items-center justify-between border-b border-[var(--border)] py-2 last:border-0">
                      <Link href={`/tickets/${t.id}`} className="flex min-w-0 items-center gap-2 hover:underline">
                        <span className="shrink-0 font-mono text-xs text-[var(--muted-foreground)]">{formatTicketReference(t.number)}</span>
                        <span className="truncate">{t.subject}</span>
                      </Link>
                      <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${m.color}22`, color: m.color }}>{m.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
