import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isReleasesEnabled } from "@/lib/settings/service";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { listReleaseTypes, listReleaseStatuses } from "@/lib/taxonomies/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { ReleaseForm } from "../release-form";
import { createReleaseAction } from "../actions";

export default async function NewReleasePage() {
  await requirePermission("releases.manage");
  if (!(await isReleasesEnabled())) notFound();
  const [clients, owners, types, statuses, dict] = await Promise.all([
    listClients({}),
    listTechnicians(),
    listReleaseTypes({ activeOnly: true }),
    listReleaseStatuses({ activeOnly: true }),
    getDictionary(),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.releases, href: "/releases" }, { label: dict.releases.new }]} />
      <h1 className="text-2xl font-semibold tracking-tight">{dict.releases.new}</h1>
      <Card>
        <CardHeader><CardTitle>{dict.releases.new}</CardTitle></CardHeader>
        <CardContent>
          <ReleaseForm
            action={createReleaseAction}
            clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
            owners={owners}
            types={types.map((t) => ({ id: t.id, name: t.name }))}
            statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
