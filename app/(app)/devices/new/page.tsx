import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isDevicesEnabled } from "@/lib/settings/service";
import { listClients } from "@/lib/clients/queries";
import { listDeviceTypes, listDeviceStatuses } from "@/lib/taxonomies/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { DeviceForm } from "../device-form";
import { createDeviceAction } from "../actions";

export default async function NewDevicePage() {
  await requirePermission("devices.manage");
  if (!(await isDevicesEnabled())) notFound();
  const [clients, types, statuses] = await Promise.all([
    listClients({}),
    listDeviceTypes({ activeOnly: true }),
    listDeviceStatuses({ activeOnly: true }),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Devices", href: "/devices" }, { label: "New device" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">New device</h1>
      <Card>
        <CardHeader><CardTitle>New device</CardTitle></CardHeader>
        <CardContent>
          <DeviceForm
            action={createDeviceAction}
            clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
            types={types.map((t) => ({ id: t.id, name: t.name }))}
            statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
            submitLabel="Create device"
          />
        </CardContent>
      </Card>
    </div>
  );
}
