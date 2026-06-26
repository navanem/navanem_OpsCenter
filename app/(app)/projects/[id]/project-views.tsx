"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge, TaskPriorityBadge } from "@/components/projects/badges";
import { TaskBoard } from "./task-board";
import { TaskTimeline } from "./task-timeline";
import { TaskCalendar } from "./task-calendar";
import type { TaskPriorityKey } from "@/lib/projects/meta";

interface TaskStatus {
  id: string;
  name: string;
  color: string;
}

interface ProjectTask {
  id: string;
  title: string;
  statusId: string;
  status: { id: string; name: string; color: string };
  priority: TaskPriorityKey;
  assignee: { id: string; firstName: string; lastName: string } | null;
  startDate: Date | string | null;
  dueDate: Date | string | null;
}

interface Props {
  tasks: ProjectTask[];
  statuses: TaskStatus[];
  canManage: boolean;
  projectId: string;
  initialYear: number;
  initialMonth: number;
}

type View = "List" | "Board" | "Timeline" | "Calendar";

export function ProjectViews({ tasks, statuses, canManage, projectId, initialYear, initialMonth }: Props) {
  const [view, setView] = useState<View>("List");

  return (
    <div className="space-y-4">
      {/* Tab switch */}
      <div className="flex items-center gap-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] p-1 w-fit">
        {(["List", "Board", "Timeline", "Calendar"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={[
              "rounded-[calc(var(--radius)-2px)] px-4 py-1.5 text-sm font-medium transition",
              view === v
                ? "bg-[var(--card)] shadow-[var(--shadow)] text-[var(--foreground)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
            ].join(" ")}
          >
            {v}
          </button>
        ))}
      </div>

      {/* List view */}
      {view === "List" ? (
        <Card>
          {tasks.length === 0 ? (
            <p className="p-6 text-[var(--muted-foreground)]">No tasks yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                  <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">
                    Assignee
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">
                    Due date
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/40"
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/projects/${projectId}/tasks/${task.id}/edit`}
                        className="font-medium text-[var(--foreground)] hover:underline"
                      >
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge
                        name={task.status.name}
                        color={task.status.color}
                      />
                    </td>
                    <td className="px-6 py-3 text-[var(--muted-foreground)]">
                      {task.assignee
                        ? `${task.assignee.firstName} ${task.assignee.lastName}`
                        : "Unassigned"}
                    </td>
                    <td className="px-6 py-3">
                      <TaskPriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-6 py-3 text-[var(--muted-foreground)]">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      ) : null}

      {view === "Board" ? (
        <TaskBoard
          projectId={projectId}
          statuses={statuses}
          tasks={tasks.map((t) => ({
            id: t.id,
            title: t.title,
            statusId: t.statusId,
            priority: t.priority,
            assignee: t.assignee
              ? { firstName: t.assignee.firstName, lastName: t.assignee.lastName }
              : null,
          }))}
          canManage={canManage}
        />
      ) : null}

      {view === "Timeline" ? (
        <TaskTimeline
          projectId={projectId}
          tasks={tasks.map((t) => ({
            id: t.id,
            title: t.title,
            startDate: t.startDate,
            dueDate: t.dueDate,
            status: { name: t.status.name, color: t.status.color },
          }))}
        />
      ) : null}

      {view === "Calendar" ? (
        <TaskCalendar
          projectId={projectId}
          initialYear={initialYear}
          initialMonth={initialMonth}
          tasks={tasks.map((t) => ({
            id: t.id,
            title: t.title,
            startDate: t.startDate,
            dueDate: t.dueDate,
            status: { name: t.status.name, color: t.status.color },
          }))}
        />
      ) : null}
    </div>
  );
}
