import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { getProject, getProjectTask } from "@/lib/projects/queries";
import { listProjectTaskStatuses } from "@/lib/taxonomies/queries";
import { listTechnicians } from "@/lib/users/queries";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskForm } from "../../../task-form";
import { TimeLogSection } from "@/components/timesheets/time-log-section";
import { updateTaskAction, deleteTaskAction } from "../../../../actions";

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

      <TimeLogSection
        context={{ taskId: task.id, label: `Linked to task "${task.title}"` }}
        redirectTo={`/projects/${id}/tasks/${task.id}/edit`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={deleteTaskAction}>
            <input type="hidden" name="id" value={task.id} />
            <input type="hidden" name="projectId" value={id} />
            <Button type="submit" variant="destructive">Delete task</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
