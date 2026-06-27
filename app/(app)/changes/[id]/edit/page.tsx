import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { isChangesEnabled } from "@/lib/settings/service";
import { getChange } from "@/lib/changes/queries";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { listChangeTypes, listChangeStatuses } from "@/lib/taxonomies/queries";
import { formatChangeReference } from "@/lib/changes/meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { ChangeForm } from "../../change-form";
import { updateChangeAction, deleteChangeAction, decideChangeAction } from "../../actions";

export default async function EditChangePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("changes.manage");
  if (!(await isChangesEnabled())) notFound();
  const { id } = await params;
  const [change, clients, technicians, types, statuses, dict] = await Promise.all([
    getChange(id),
    listClients({}),
    listTechnicians(),
    listChangeTypes({ activeOnly: true }),
    listChangeStatuses({ activeOnly: true }),
    getDictionary(),
  ]);
  if (!change) notFound();

  const ref = formatChangeReference(change.number);
  const canApprove = can(user, "changes.approve");

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.changes, href: "/changes" }, { label: ref }]} />
      <h1 className="text-2xl font-semibold tracking-tight">{change.title} <span className="font-mono text-base text-[var(--muted-foreground)]">{ref}</span></h1>

      {/* Approval */}
      <Card>
        <CardHeader><CardTitle>{dict.changes.approval}</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          {change.approvedAt ? (
            <p className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#10b98122] px-2 py-0.5 text-xs font-medium text-[#10b981]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" /> {dict.changes.kpiApproved}
              </span>
              <span className="text-[var(--muted-foreground)]">
                {dict.changes.approvedBy} {change.approvedBy ? `${change.approvedBy.firstName} ${change.approvedBy.lastName}` : "—"} · {new Date(change.approvedAt).toLocaleString()}
              </span>
            </p>
          ) : (
            <p className="text-[var(--muted-foreground)]">{change.status.name}</p>
          )}
          {canApprove ? (
            <div className="flex gap-2">
              <form action={decideChangeAction}>
                <input type="hidden" name="id" value={change.id} />
                <input type="hidden" name="decision" value="approve" />
                <Button type="submit" size="sm">{dict.changes.approve}</Button>
              </form>
              <form action={decideChangeAction}>
                <input type="hidden" name="id" value={change.id} />
                <input type="hidden" name="decision" value="reject" />
                <Button type="submit" variant="outline" size="sm" className="text-[var(--destructive)]">{dict.changes.reject}</Button>
              </form>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{ref}</CardTitle></CardHeader>
        <CardContent>
          <ChangeForm
            action={updateChangeAction}
            clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
            technicians={technicians}
            types={types.map((t) => ({ id: t.id, name: t.name }))}
            statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
            defaults={{
              id: change.id,
              title: change.title,
              description: change.description,
              typeId: change.typeId,
              statusId: change.statusId,
              clientId: change.clientId,
              assigneeId: change.assigneeId,
              risk: change.risk,
              impact: change.impact,
              plannedStart: change.plannedStart,
              plannedEnd: change.plannedEnd,
              implementationPlan: change.implementationPlan,
              rollbackPlan: change.rollbackPlan,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Danger zone</CardTitle></CardHeader>
        <CardContent>
          <form action={deleteChangeAction}>
            <input type="hidden" name="id" value={change.id} />
            <Button type="submit" variant="destructive">{dict.common.delete}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
