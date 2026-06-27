import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isChangesEnabled } from "@/lib/settings/service";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { listChangeTypes, listChangeStatuses } from "@/lib/taxonomies/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { ChangeForm } from "../change-form";
import { createChangeAction } from "../actions";

export default async function NewChangePage() {
  await requirePermission("changes.manage");
  if (!(await isChangesEnabled())) notFound();
  const [clients, technicians, types, statuses, dict] = await Promise.all([
    listClients({}),
    listTechnicians(),
    listChangeTypes({ activeOnly: true }),
    listChangeStatuses({ activeOnly: true }),
    getDictionary(),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.changes, href: "/changes" }, { label: dict.changes.new }]} />
      <h1 className="text-2xl font-semibold tracking-tight">{dict.changes.new}</h1>
      <Card>
        <CardHeader><CardTitle>{dict.changes.new}</CardTitle></CardHeader>
        <CardContent>
          <ChangeForm
            action={createChangeAction}
            clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
            technicians={technicians}
            types={types.map((t) => ({ id: t.id, name: t.name }))}
            statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
