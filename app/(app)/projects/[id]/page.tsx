import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { getProject } from "@/lib/projects/queries";
import { listProjectTaskStatuses } from "@/lib/taxonomies/queries";
import { formatProjectReference } from "@/lib/projects/meta";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/projects/badges";
import { deleteProjectAction } from "../actions";
import { ProjectViews } from "./project-views";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePermission("projects.read");
  const { id } = await params;

  const [project, taskStatuses] = await Promise.all([
    getProject(id),
    listProjectTaskStatuses({ activeOnly: true }),
  ]);

  if (!project) notFound();

  const canManage = can(user, "projects.manage");
  const now = new Date();

  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter(
    (t) => t.status.name.toLowerCase() === "done",
  ).length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/projects" },
          { label: project.name },
        ]}
      />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs">
            {formatProjectReference(project.number)}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          <StatusBadge name={project.status.name} color={project.status.color} />
        </div>
        {canManage ? (
          <div className="flex items-center gap-2">
            <Link href={`/projects/${id}/edit`}>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </Link>
            <form action={deleteProjectAction}>
              <input type="hidden" name="id" value={id} />
              <Button variant="destructive" size="sm" type="submit">
                Delete
              </Button>
            </form>
            <Link href={`/projects/${id}/tasks/new`}>
              <Button size="sm">Add task</Button>
            </Link>
          </div>
        ) : null}
      </div>

      {/* Overview card */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                Client
              </dt>
              <dd className="mt-1 text-sm">{project.client?.companyName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                Lead
              </dt>
              <dd className="mt-1 text-sm">
                {project.lead
                  ? `${project.lead.firstName} ${project.lead.lastName}`
                  : "Unassigned"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                Start date
              </dt>
              <dd className="mt-1 text-sm">
                {project.startDate
                  ? new Date(project.startDate).toLocaleDateString()
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                Due date
              </dt>
              <dd className="mt-1 text-sm">
                {project.dueDate
                  ? new Date(project.dueDate).toLocaleDateString()
                  : "—"}
              </dd>
            </div>
          </dl>

          {/* Progress */}
          <div className="mt-6">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Progress</span>
              <span className="font-medium">
                {doneTasks} of {totalTasks} tasks done
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
              <div
                className="h-full rounded-full bg-[var(--primary)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks views */}
      <ProjectViews
        tasks={project.tasks}
        statuses={taskStatuses}
        canManage={canManage}
        projectId={project.id}
        initialYear={now.getFullYear()}
        initialMonth={now.getMonth()}
      />
    </div>
  );
}
