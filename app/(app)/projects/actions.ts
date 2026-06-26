"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import {
  projectSchema,
  normalizeProjectInput,
  taskSchema,
  normalizeTaskInput,
} from "@/lib/validation/project";

// ---------------------------------------------------------------------------
// Project actions
// ---------------------------------------------------------------------------

export interface ProjectFormState {
  error?: string;
}

export async function createProjectAction(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requirePermission("projects.manage");
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    clientId: formData.get("clientId"),
    statusId: formData.get("statusId"),
    leadId: formData.get("leadId"),
    startDate: formData.get("startDate"),
    dueDate: formData.get("dueDate"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const status = await prisma.projectStatus.findUnique({
    where: { id: parsed.data.statusId },
  });
  if (!status) {
    return { error: "Selected status no longer exists." };
  }
  const project = await prisma.project.create({
    data: normalizeProjectInput(parsed.data),
  });
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function updateProjectAction(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requirePermission("projects.manage");
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return { error: "Missing project id." };
  }
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    clientId: formData.get("clientId"),
    statusId: formData.get("statusId"),
    leadId: formData.get("leadId"),
    startDate: formData.get("startDate"),
    dueDate: formData.get("dueDate"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const status = await prisma.projectStatus.findUnique({
    where: { id: parsed.data.statusId },
  });
  if (!status) {
    return { error: "Selected status no longer exists." };
  }
  await prisma.project.update({
    where: { id },
    data: normalizeProjectInput(parsed.data),
  });
  revalidatePath("/projects");
  redirect(`/projects/${id}`);
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  await requirePermission("projects.manage");
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    await prisma.project.delete({ where: { id } });
    revalidatePath("/projects");
  }
  redirect("/projects");
}

// ---------------------------------------------------------------------------
// Task actions
// ---------------------------------------------------------------------------

export interface TaskFormState {
  error?: string;
}

export async function createTaskAction(
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  await requirePermission("projects.manage");
  const projectId = formData.get("projectId");
  if (typeof projectId !== "string" || projectId.length === 0) {
    return { error: "Missing project id." };
  }
  const parsed = taskSchema.safeParse({
    projectId,
    title: formData.get("title"),
    description: formData.get("description"),
    statusId: formData.get("statusId"),
    assigneeId: formData.get("assigneeId"),
    priority: formData.get("priority"),
    startDate: formData.get("startDate"),
    dueDate: formData.get("dueDate"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const taskStatus = await prisma.projectTaskStatus.findUnique({
    where: { id: parsed.data.statusId },
  });
  if (!taskStatus) {
    return { error: "Selected status no longer exists." };
  }
  await prisma.projectTask.create({
    data: { projectId, ...normalizeTaskInput(parsed.data) },
  });
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function updateTaskAction(
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  await requirePermission("projects.manage");
  const id = formData.get("id");
  const projectId = formData.get("projectId");
  if (typeof id !== "string" || id.length === 0) {
    return { error: "Missing task id." };
  }
  if (typeof projectId !== "string" || projectId.length === 0) {
    return { error: "Missing project id." };
  }
  const parsed = taskSchema.safeParse({
    projectId,
    title: formData.get("title"),
    description: formData.get("description"),
    statusId: formData.get("statusId"),
    assigneeId: formData.get("assigneeId"),
    priority: formData.get("priority"),
    startDate: formData.get("startDate"),
    dueDate: formData.get("dueDate"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const taskStatus = await prisma.projectTaskStatus.findUnique({
    where: { id: parsed.data.statusId },
  });
  if (!taskStatus) {
    return { error: "Selected status no longer exists." };
  }
  await prisma.projectTask.update({
    where: { id },
    data: normalizeTaskInput(parsed.data),
  });
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function deleteTaskAction(formData: FormData): Promise<void> {
  await requirePermission("projects.manage");
  const id = formData.get("id");
  const projectId = formData.get("projectId");
  if (typeof id === "string" && id.length > 0) {
    await prisma.projectTask.delete({ where: { id } });
  }
  revalidatePath(
    typeof projectId === "string" && projectId.length > 0
      ? `/projects/${projectId}`
      : "/projects",
  );
  redirect(
    typeof projectId === "string" && projectId.length > 0
      ? `/projects/${projectId}`
      : "/projects",
  );
}

// ---------------------------------------------------------------------------
// Board RPC: move task to a different status column
// ---------------------------------------------------------------------------

export async function moveTaskAction(
  taskId: string,
  statusId: string,
): Promise<void> {
  await requirePermission("projects.manage");
  const taskStatus = await prisma.projectTaskStatus.findUnique({
    where: { id: statusId },
  });
  if (!taskStatus) return;
  const task = await prisma.projectTask.findUnique({ where: { id: taskId } });
  if (!task || task.statusId === statusId) return;
  await prisma.projectTask.update({
    where: { id: taskId },
    data: { statusId },
  });
  revalidatePath(`/projects/${task.projectId}`);
}

// ---------------------------------------------------------------------------
// Board RPC: reorder tasks within a column (and move across columns)
// ---------------------------------------------------------------------------

export async function reorderTasksAction(
  taskId: string,
  statusId: string,
  orderedIds: string[],
): Promise<void> {
  await requirePermission("projects.manage");
  const [taskStatus, task] = await Promise.all([
    prisma.projectTaskStatus.findUnique({ where: { id: statusId } }),
    prisma.projectTask.findUnique({ where: { id: taskId } }),
  ]);
  if (!taskStatus || !task) return;
  await prisma.$transaction([
    prisma.projectTask.update({ where: { id: taskId }, data: { statusId } }),
    ...orderedIds.map((id, index) =>
      prisma.projectTask.update({ where: { id }, data: { sortOrder: index } }),
    ),
  ]);
  revalidatePath(`/projects/${task.projectId}`);
}

// ---------------------------------------------------------------------------
// Assign task (separate permission: projects.assign)
// ---------------------------------------------------------------------------

export async function assignTaskAction(formData: FormData): Promise<void> {
  await requirePermission("projects.assign");
  const id = formData.get("id");
  const projectId = formData.get("projectId");
  const assigneeRaw = formData.get("assigneeId");
  const assigneeId =
    typeof assigneeRaw === "string" && assigneeRaw.length > 0
      ? assigneeRaw
      : null;
  if (typeof id === "string" && id.length > 0) {
    await prisma.projectTask.update({
      where: { id },
      data: { assigneeId },
    });
    if (typeof projectId === "string" && projectId.length > 0) {
      revalidatePath(`/projects/${projectId}`);
    }
  }
  redirect(
    typeof projectId === "string" && projectId.length > 0
      ? `/projects/${projectId}`
      : "/projects",
  );
}
