import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { getProject } from "@/lib/projects/queries";
import { getProjectTask } from "@/lib/projects/queries";
import { listProjectTaskStatuses } from "@/lib/taxonomies/queries";
import { listTechnicians } from "@/lib/users/queries";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskForm } from "../../../task-form";
import { updateTaskAction } from "../../../../actions";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  await requirePermission("projects.manage");
  const { id, taskId } = await params;

  const [task, project, statuses, technicians] = await Promise.all([
    getProjectTask(taskId),
    getProject(id),
    listProjectTaskStatuses({ activeOnly: true }),
    listTechnicians(),
  ]);

  if (!task || task.projectId !== id) notFound();
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/projects" },
          { label: project.name, href: `/projects/${id}` },
          { label: task.title },
        ]}
      />
      <h1 className="text-2xl font-semibold tracking-tight">Edit task</h1>
      <Card>
        <CardHeader>
          <CardTitle>{task.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm
            action={updateTaskAction}
            projectId={id}
            statuses={statuses}
            technicians={technicians}
            defaults={{
              id: task.id,
              projectId: id,
              title: task.title,
              description: task.description,
              statusId: task.statusId,
              assigneeId: task.assigneeId,
              priority: task.priority,
              startDate: task.startDate,
              dueDate: task.dueDate,
            }}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
