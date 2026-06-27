import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isProblemsEnabled } from "@/lib/settings/service";
import { getProblem } from "@/lib/problems/queries";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { listProblemTypes, listProblemStatuses } from "@/lib/taxonomies/queries";
import { formatProblemReference } from "@/lib/problems/meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { ProblemForm } from "../../problem-form";
import { updateProblemAction, deleteProblemAction } from "../../actions";

export default async function EditProblemPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("problems.manage");
  if (!(await isProblemsEnabled())) notFound();
  const { id } = await params;
  const [problem, clients, technicians, types, statuses, dict] = await Promise.all([
    getProblem(id),
    listClients({}),
    listTechnicians(),
    listProblemTypes({ activeOnly: true }),
    listProblemStatuses({ activeOnly: true }),
    getDictionary(),
  ]);
  if (!problem) notFound();

  const ref = formatProblemReference(problem.number);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.problems, href: "/problems" }, { label: ref }]} />
      <h1 className="text-2xl font-semibold tracking-tight">{problem.title} <span className="font-mono text-base text-[var(--muted-foreground)]">{ref}</span></h1>

      <Card>
        <CardHeader><CardTitle>{ref}</CardTitle></CardHeader>
        <CardContent>
          <ProblemForm
            action={updateProblemAction}
            clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
            technicians={technicians}
            types={types.map((t) => ({ id: t.id, name: t.name }))}
            statuses={statuses.map((s) => ({ id: s.id, name: s.name }))}
            defaults={{
              id: problem.id,
              title: problem.title,
              description: problem.description,
              typeId: problem.typeId,
              statusId: problem.statusId,
              clientId: problem.clientId,
              assigneeId: problem.assigneeId,
              priority: problem.priority,
              impact: problem.impact,
              rootCause: problem.rootCause,
              workaround: problem.workaround,
              resolution: problem.resolution,
              knownError: problem.knownError,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Danger zone</CardTitle></CardHeader>
        <CardContent>
          <form action={deleteProblemAction}>
            <input type="hidden" name="id" value={problem.id} />
            <Button type="submit" variant="destructive">{dict.common.delete}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
