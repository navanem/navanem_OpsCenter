import { prisma } from "@/lib/db";
import { buildProjectWhere, type ProjectFilters } from "./where";

export function listProjects(filters: ProjectFilters) {
  return prisma.project.findMany({
    where: buildProjectWhere(filters),
    include: {
      status: { select: { id: true, name: true, color: true } },
      client: { select: { id: true, companyName: true } },
      lead: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { tasks: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getProjectStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [total, withoutLead, overdue, taskCount] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { leadId: null } }),
    prisma.project.count({ where: { dueDate: { lt: today } } }),
    prisma.projectTask.count(),
  ]);
  return { total, withoutLead, overdue, taskCount };
}

export function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      status: { select: { id: true, name: true, color: true } },
      client: { select: { id: true, companyName: true } },
      lead: { select: { id: true, firstName: true, lastName: true } },
      tasks: {
        include: {
          status: { select: { id: true, name: true, color: true } },
          assignee: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });
}

export function getProjectTask(id: string) {
  return prisma.projectTask.findUnique({
    where: { id },
    include: { status: { select: { id: true, name: true } } },
  });
}
