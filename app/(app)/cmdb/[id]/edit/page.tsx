import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isCmdbEnabled } from "@/lib/settings/service";
import { getConfigItem, listConfigItemOptions } from "@/lib/cmdb/queries";
import { listClients } from "@/lib/clients/queries";
import { listDevices } from "@/lib/devices/queries";
import { listConfigItemTypes, listConfigItemStatuses } from "@/lib/taxonomies/queries";
import { formatCiReference } from "@/lib/cmdb/meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { ConfigItemForm } from "../../configitem-form";
import { updateConfigItemAction, deleteConfigItemAction } from "../../actions";

export default async function EditConfigItemPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("cmdb.manage");
  if (!(await isCmdbEnabled())) notFound();
  const { id } = await params;
  const [ci, clients, devices, types, statuses, relatedOptions, dict] = await Promise.all([
    getConfigItem(id),
    listClients({}),
    listDevices({}),
    listConfigItemTypes({ activeOnly: true }),
    listConfigItemStatuses({ activeOnly: true }),
    listConfigItemOptions(id),
    getDictionary(),
  ]);
  if (!ci) notFound();

  const ref = formatCiReference(ci.number);
  const relatedIds = [...ci.relatedTo.map((r) => r.id), ...ci.relatedFrom.map((r) => r.id)];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.cmdb, href: "/cmdb" }, { label: ref }]} />
      <h1 className="text-2xl font-semibold tracking-tight">{ci.name} <span className="font-mono text-base text-[var(--muted-foreground)]">{ref}</span></h1>

      <Card>
        <CardHeader><CardTitle>{ref}</CardTitle></CardHeader>
        <CardContent>
          <ConfigItemForm
            action={updateConfigItemAction}
            clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
            devices={devices.map((d) => ({ id: d.id, name: d.name }))}
            types={types.map((t) => ({ id: t.id, name: t.name }))}
            statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
            relatedOptions={relatedOptions}
            defaults={{
              id: ci.id,
              name: ci.name,
              typeId: ci.typeId,
              statusId: ci.statusId,
              clientId: ci.clientId,
              deviceId: ci.deviceId,
              environment: ci.environment,
              location: ci.location,
              owner: ci.owner,
              description: ci.description,
              relatedIds,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Danger zone</CardTitle></CardHeader>
        <CardContent>
          <form action={deleteConfigItemAction}>
            <input type="hidden" name="id" value={ci.id} />
            <Button type="submit" variant="destructive">{dict.common.delete}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
