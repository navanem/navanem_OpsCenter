import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isReleasesEnabled } from "@/lib/settings/service";
import { getRelease } from "@/lib/releases/queries";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { listReleaseTypes, listReleaseStatuses } from "@/lib/taxonomies/queries";
import { formatReleaseReference } from "@/lib/releases/meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { ReleaseForm } from "../../release-form";
import { updateReleaseAction, deleteReleaseAction } from "../../actions";

export default async function EditReleasePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("releases.manage");
  if (!(await isReleasesEnabled())) notFound();
  const { id } = await params;
  const [release, clients, owners, types, statuses, dict] = await Promise.all([
    getRelease(id),
    listClients({}),
    listTechnicians(),
    listReleaseTypes({ activeOnly: true }),
    listReleaseStatuses({ activeOnly: true }),
    getDictionary(),
  ]);
  if (!release) notFound();

  const ref = formatReleaseReference(release.number);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.releases, href: "/releases" }, { label: ref }]} />
      <h1 className="text-2xl font-semibold tracking-tight">{release.name} <span className="font-mono text-base text-[var(--muted-foreground)]">{ref}</span></h1>

      <Card>
        <CardHeader><CardTitle>{ref}</CardTitle></CardHeader>
        <CardContent>
          <ReleaseForm
            action={updateReleaseAction}
            clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
            owners={owners}
            types={types.map((t) => ({ id: t.id, name: t.name }))}
            statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
            defaults={{
              id: release.id,
              name: release.name,
              version: release.version,
              description: release.description,
              typeId: release.typeId,
              statusId: release.statusId,
              clientId: release.clientId,
              ownerId: release.ownerId,
              plannedDate: release.plannedDate,
              releasedDate: release.releasedDate,
              releaseNotes: release.releaseNotes,
              rollbackPlan: release.rollbackPlan,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Danger zone</CardTitle></CardHeader>
        <CardContent>
          <form action={deleteReleaseAction}>
            <input type="hidden" name="id" value={release.id} />
            <Button type="submit" variant="destructive">{dict.common.delete}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
