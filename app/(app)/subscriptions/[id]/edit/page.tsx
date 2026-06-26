import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isSubscriptionsEnabled } from "@/lib/settings/service";
import { getSubscription } from "@/lib/subscriptions/queries";
import { listClients } from "@/lib/clients/queries";
import { listSubscriptionTypes, listSubscriptionStatuses } from "@/lib/taxonomies/queries";
import { formatSubscriptionReference } from "@/lib/subscriptions/meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SubscriptionForm } from "../../subscription-form";
import { updateSubscriptionAction, deleteSubscriptionAction } from "../../actions";

type Cycle = "MONTHLY" | "QUARTERLY" | "YEARLY" | "ONE_OFF";

export default async function EditSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("subscriptions.manage");
  if (!(await isSubscriptionsEnabled())) notFound();
  const { id } = await params;
  const [sub, clients, types, statuses] = await Promise.all([
    getSubscription(id),
    listClients({}),
    listSubscriptionTypes({ activeOnly: true }),
    listSubscriptionStatuses({ activeOnly: true }),
  ]);
  if (!sub) notFound();

  const ref = formatSubscriptionReference(sub.number);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Subscriptions", href: "/subscriptions" }, { label: ref }]} />
      <h1 className="text-2xl font-semibold tracking-tight">{sub.name} <span className="font-mono text-base text-[var(--muted-foreground)]">{ref}</span></h1>
      <Card>
        <CardHeader><CardTitle>Subscription details</CardTitle></CardHeader>
        <CardContent>
          <SubscriptionForm
            action={updateSubscriptionAction}
            clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
            types={types.map((t) => ({ id: t.id, name: t.name }))}
            statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
            defaults={{
              id: sub.id,
              name: sub.name,
              typeId: sub.typeId,
              statusId: sub.statusId,
              clientId: sub.clientId,
              provider: sub.provider,
              reference: sub.reference,
              costCents: sub.costCents,
              billingCycle: sub.billingCycle as Cycle,
              seats: sub.seats,
              startDate: sub.startDate,
              renewalDate: sub.renewalDate,
              autoRenew: sub.autoRenew,
              supportLevel: sub.supportLevel,
              warrantyEnd: sub.warrantyEnd,
              notes: sub.notes,
            }}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Danger zone</CardTitle></CardHeader>
        <CardContent>
          <form action={deleteSubscriptionAction}>
            <input type="hidden" name="id" value={sub.id} />
            <Button type="submit" variant="destructive">Delete subscription</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
