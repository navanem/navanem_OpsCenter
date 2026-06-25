import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { getProject } from "@/lib/projects/queries";
import { listProjectTaskStatuses } from "@/lib/taxonomies/queries";
import { listTechnicians } from "@/lib/users/queries";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskForm } from "../../task-form";
import { createTaskAction } from "../../../actions";

export default async function NewTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("projects.manage");
  const { id } = await params;

  const [project, statuses, technicians] = await Promise.all([
    getProject(id),
    listProjectTaskStatuses({ activeOnly: true }),
    listTechnicians(),
  ]);

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/projects" },
          { label: project.name, href: `/projects/${id}` },
          { label: "New task" },
        ]}
      />
      <h1 className="text-2xl font-semibold tracking-tight">New task</h1>
      <Card>
        <CardHeader>
          <CardTitle>Task details</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm
            action={createTaskAction}
            projectId={id}
            statuses={statuses}
            technicians={technicians}
            submitLabel="Add task"
          />
        </CardContent>
      </Card>
    </div>
  );
}
