import { requirePermission } from "@/lib/auth/guard";
import { listTechnicians } from "@/lib/users/queries";
import { listClients } from "@/lib/clients/queries";
import { listProjectStatuses } from "@/lib/taxonomies/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProjectForm } from "../project-form";
import { createProjectAction } from "../actions";

export default async function NewProjectPage() {
  await requirePermission("projects.manage");
  const [statuses, clients, technicians] = await Promise.all([
    listProjectStatuses({ activeOnly: true }),
    listClients({}),
    listTechnicians(),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/projects" },
          { label: "New project" },
        ]}
      />
      <h1 className="text-2xl font-semibold tracking-tight">New project</h1>
      <Card>
        <CardHeader>
          <CardTitle>New project</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm
            action={createProjectAction}
            statuses={statuses}
            clients={clients}
            technicians={technicians}
            submitLabel="Create project"
          />
        </CardContent>
      </Card>
    </div>
  );
}
