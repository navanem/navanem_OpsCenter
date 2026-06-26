import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { isDevicesEnabled } from "@/lib/settings/service";
import { getDevice, listDeviceTickets } from "@/lib/devices/queries";
import { listClients } from "@/lib/clients/queries";
import { listDeviceTypes, listDeviceStatuses } from "@/lib/taxonomies/queries";
import { formatDeviceReference } from "@/lib/devices/meta";
import { formatTicketReference, TICKET_STATUS_META, type TicketStatusKey } from "@/lib/tickets/meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { DeviceForm } from "../../device-form";
import { updateDeviceAction, deleteDeviceAction } from "../../actions";

export default async function EditDevicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("devices.manage");
  if (!(await isDevicesEnabled())) notFound();
  const { id } = await params;
  const canReadTickets = can(user, "tickets.read");
  const [device, clients, types, statuses, tickets] = await Promise.all([
    getDevice(id),
    listClients({}),
    listDeviceTypes({ activeOnly: true }),
    listDeviceStatuses({ activeOnly: true }),
    canReadTickets ? listDeviceTickets(id) : Promise.resolve([]),
  ]);
  if (!device) notFound();

  const ref = formatDeviceReference(device.number);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Devices", href: "/devices" }, { label: ref }]} />
      <h1 className="text-2xl font-semibold tracking-tight">{device.name} <span className="font-mono text-base text-[var(--muted-foreground)]">{ref}</span></h1>
      <Card>
        <CardHeader><CardTitle>Device details</CardTitle></CardHeader>
        <CardContent>
          <DeviceForm
            action={updateDeviceAction}
            clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
            types={types.map((t) => ({ id: t.id, name: t.name }))}
            statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
            defaults={{
              id: device.id,
              name: device.name,
              typeId: device.typeId,
              statusId: device.statusId,
              clientId: device.clientId,
              serialNumber: device.serialNumber,
              manufacturer: device.manufacturer,
              model: device.model,
              hostname: device.hostname,
              purchaseDate: device.purchaseDate,
              warrantyExpiry: device.warrantyExpiry,
              notes: device.notes,
            }}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>

      {canReadTickets ? (
        <Card>
          <CardHeader>
            <CardTitle>
              Related tickets{" "}
              <span className="text-sm font-normal text-[var(--muted-foreground)]">({tickets.length})</span>
            </CardTitle>
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
                      <Link href={`/tickets/${t.id}`} className="flex items-center gap-2 min-w-0 hover:underline">
                        <span className="font-mono text-xs text-[var(--muted-foreground)] shrink-0">{formatTicketReference(t.number)}</span>
                        <span className="truncate">{t.subject}</span>
                      </Link>
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium shrink-0" style={{ backgroundColor: `${m.color}22`, color: m.color }}>
                        {m.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader><CardTitle>Danger zone</CardTitle></CardHeader>
        <CardContent>
          <form action={deleteDeviceAction}>
            <input type="hidden" name="id" value={device.id} />
            <Button type="submit" variant="destructive">Delete device</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
