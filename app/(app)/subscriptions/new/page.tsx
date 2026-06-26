import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isSubscriptionsEnabled } from "@/lib/settings/service";
import { listClients } from "@/lib/clients/queries";
import { listSubscriptionTypes, listSubscriptionStatuses } from "@/lib/taxonomies/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SubscriptionForm } from "../subscription-form";
import { createSubscriptionAction } from "../actions";

export default async function NewSubscriptionPage() {
  await requirePermission("subscriptions.manage");
  if (!(await isSubscriptionsEnabled())) notFound();
  const [clients, types, statuses] = await Promise.all([
    listClients({}),
    listSubscriptionTypes({ activeOnly: true }),
    listSubscriptionStatuses({ activeOnly: true }),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Subscriptions", href: "/subscriptions" }, { label: "New subscription" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">New subscription</h1>
      <Card>
        <CardHeader><CardTitle>New subscription</CardTitle></CardHeader>
        <CardContent>
          <SubscriptionForm
            action={createSubscriptionAction}
            clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
            types={types.map((t) => ({ id: t.id, name: t.name }))}
            statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
            submitLabel="Create subscription"
          />
        </CardContent>
      </Card>
    </div>
  );
}
