import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isDevicesEnabled } from "@/lib/settings/service";
import { getDevice } from "@/lib/devices/queries";
import { listClients } from "@/lib/clients/queries";
import { listDeviceTypes, listDeviceStatuses } from "@/lib/taxonomies/queries";
import { formatDeviceReference } from "@/lib/devices/meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { DeviceForm } from "../../device-form";
import { updateDeviceAction, deleteDeviceAction } from "../../actions";

export default async function EditDevicePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("devices.manage");
  if (!(await isDevicesEnabled())) notFound();
  const { id } = await params;
  const [device, clients, types, statuses] = await Promise.all([
    getDevice(id),
    listClients({}),
    listDeviceTypes({ activeOnly: true }),
    listDeviceStatuses({ activeOnly: true }),
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
