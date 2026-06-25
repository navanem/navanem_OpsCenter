import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { getProject } from "@/lib/projects/queries";
import { listTechnicians } from "@/lib/users/queries";
import { listClients } from "@/lib/clients/queries";
import { listProjectStatuses } from "@/lib/taxonomies/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProjectForm } from "../../project-form";
import { updateProjectAction } from "../../actions";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("projects.manage");
  const { id } = await params;
  const [project, statuses, clients, technicians] = await Promise.all([
    getProject(id),
    listProjectStatuses({ activeOnly: true }),
    listClients({}),
    listTechnicians(),
  ]);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/projects" },
          { label: project.name, href: `/projects/${project.id}` },
          { label: "Edit" },
        ]}
      />
      <h1 className="text-2xl font-semibold tracking-tight">Edit project</h1>
      <Card>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm
            action={updateProjectAction}
            statuses={statuses}
            clients={clients}
            technicians={technicians}
            defaults={{
              id: project.id,
              name: project.name,
              description: project.description,
              statusId: project.statusId,
              clientId: project.clientId,
              leadId: project.leadId,
              startDate: project.startDate,
              dueDate: project.dueDate,
            }}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
