import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isCmdbEnabled } from "@/lib/settings/service";
import { listClients } from "@/lib/clients/queries";
import { listDevices } from "@/lib/devices/queries";
import { listConfigItemTypes, listConfigItemStatuses } from "@/lib/taxonomies/queries";
import { listConfigItemOptions } from "@/lib/cmdb/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { ConfigItemForm } from "../configitem-form";
import { createConfigItemAction } from "../actions";

export default async function NewConfigItemPage() {
  await requirePermission("cmdb.manage");
  if (!(await isCmdbEnabled())) notFound();
  const [clients, devices, types, statuses, relatedOptions, dict] = await Promise.all([
    listClients({}),
    listDevices({}),
    listConfigItemTypes({ activeOnly: true }),
    listConfigItemStatuses({ activeOnly: true }),
    listConfigItemOptions(),
    getDictionary(),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.cmdb, href: "/cmdb" }, { label: dict.cmdb.new }]} />
      <h1 className="text-2xl font-semibold tracking-tight">{dict.cmdb.new}</h1>
      <Card>
        <CardHeader><CardTitle>{dict.cmdb.new}</CardTitle></CardHeader>
        <CardContent>
          <ConfigItemForm
            action={createConfigItemAction}
            clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
            devices={devices.map((d) => ({ id: d.id, name: d.name }))}
            types={types.map((t) => ({ id: t.id, name: t.name }))}
            statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
            relatedOptions={relatedOptions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
