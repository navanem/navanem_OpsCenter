import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isProblemsEnabled } from "@/lib/settings/service";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { listProblemTypes, listProblemStatuses } from "@/lib/taxonomies/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { ProblemForm } from "../problem-form";
import { createProblemAction } from "../actions";

export default async function NewProblemPage() {
  await requirePermission("problems.manage");
  if (!(await isProblemsEnabled())) notFound();
  const [clients, technicians, types, statuses, dict] = await Promise.all([
    listClients({}),
    listTechnicians(),
    listProblemTypes({ activeOnly: true }),
    listProblemStatuses({ activeOnly: true }),
    getDictionary(),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.problems, href: "/problems" }, { label: dict.problems.new }]} />
      <h1 className="text-2xl font-semibold tracking-tight">{dict.problems.new}</h1>
      <Card>
        <CardHeader><CardTitle>{dict.problems.new}</CardTitle></CardHeader>
        <CardContent>
          <ProblemForm
            action={createProblemAction}
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
