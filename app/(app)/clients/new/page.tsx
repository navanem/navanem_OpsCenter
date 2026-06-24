import { requirePermission } from "@/lib/auth/guard";
import { listTechnicians } from "@/lib/users/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientForm } from "../client-form";
import { createClientAction } from "../actions";

export default async function NewClientPage() {
  await requirePermission("clients.manage");
  const technicians = await listTechnicians();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">New client</h1>
      <Card>
        <CardHeader>
          <CardTitle>Client details</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm action={createClientAction} technicians={technicians} submitLabel="Create client" />
        </CardContent>
      </Card>
    </div>
  );
}
