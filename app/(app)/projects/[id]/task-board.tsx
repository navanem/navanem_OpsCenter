"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TaskPriorityBadge } from "@/components/projects/badges";
import { reorderTasksAction, setTaskAssigneeAction } from "../actions";
import type { TaskPriorityKey } from "@/lib/projects/meta";

export interface BoardTask {
  id: string;
  title: string;
  statusId: string;
  priority: TaskPriorityKey;
  assigneeId: string | null;
  assignee: { firstName: string; lastName: string } | null;
}

interface TaskStatus {
  id: string;
  name: string;
  color: string;
}

interface Props {
  projectId: string;
  statuses: TaskStatus[];
  technicians: { id: string; firstName: string; lastName: string }[];
  tasks: BoardTask[];
  canManage: boolean;
  canAssign: boolean;
}

export function TaskBoard({ projectId, statuses, technicians, tasks, canManage, canAssign }: Props) {
  const [items, setItems] = useState(tasks);
  const [dragId, setDragId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  // Drop the dragged task into `statusId`, before `beforeId` (or at the end when null).
  function handleDrop(statusId: string, beforeId: string | null) {
    if (!dragId || !canManage) return;
    const id = dragId;
    setDragId(null);
    const moved = items.find((t) => t.id === id);
    if (!moved) return;

    const without = items.filter((t) => t.id !== id);
    const movedNew = { ...moved, statusId };
    const targetCol = without.filter((t) => t.statusId === statusId);
    let insertIdx = beforeId ? targetCol.findIndex((t) => t.id === beforeId) : targetCol.length;
    if (insertIdx < 0) insertIdx = targetCol.length;
    targetCol.splice(insertIdx, 0, movedNew);

    const orderedIds = targetCol.map((t) => t.id);
    const others = without.filter((t) => t.statusId !== statusId);
    setItems([...others, ...targetCol]);

    startTransition(async () => {
      await reorderTasksAction(id, statusId, orderedIds);
      router.refresh();
    });
  }

  const techById = new Map(technicians.map((t) => [t.id, t]));

  function assign(taskId: string, assigneeId: string) {
    const tech = assigneeId ? techById.get(assigneeId) : null;
    setItems((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              assigneeId: assigneeId || null,
              assignee: tech ? { firstName: tech.firstName, lastName: tech.lastName } : null,
            }
          : t,
      ),
    );
    startTransition(async () => {
      await setTaskAssigneeAction(taskId, assigneeId || null);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statuses.map((status) => {
        const column = items.filter((t) => t.statusId === status.id);
        return (
          <div
            key={status.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(status.id, null)}
            className="flex w-72 shrink-0 flex-col rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)]"
          >
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              <span className="text-sm font-bold">{status.name}</span>
              <span className="ml-auto text-xs text-[var(--muted-foreground)]">
                {column.length}
              </span>
            </div>
            <div className="flex min-h-24 flex-col gap-2 p-3">
              {column.map((task) => (
                <div
                  key={task.id}
                  draggable={canManage}
                  onDragStart={() => setDragId(task.id)}
                  onDragOver={(e) => {
                    if (canManage && dragId && dragId !== task.id) e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.stopPropagation();
                    handleDrop(status.id, task.id);
                  }}
                  className={[
                    "cursor-grab rounded-[var(--radius)] border bg-[var(--muted)] p-3 text-sm shadow-sm transition hover:border-[var(--ring)] active:cursor-grabbing",
                    dragId === task.id ? "border-[var(--ring)] opacity-50" : "border-[var(--border)]",
                  ].join(" ")}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <TaskPriorityBadge priority={task.priority} />
                  </div>
                  <Link
                    href={`/projects/${projectId}/tasks/${task.id}/edit`}
                    className="font-medium hover:underline"
                  >
                    {task.title}
                  </Link>
                  {canAssign ? (
                    <select
                      value={task.assigneeId ?? ""}
                      onChange={(e) => assign(task.id, e.target.value)}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1.5 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--card)] px-1.5 py-1 text-xs"
                    >
                      <option value="">Unassigned</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.firstName} {t.lastName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {task.assignee
                        ? `${task.assignee.firstName} ${task.assignee.lastName}`
                        : "Unassigned"}
                    </div>
                  )}
                </div>
              ))}
              {column.length === 0 ? (
                <p className="px-1 py-2 text-xs text-[var(--muted-foreground)]">
                  No tasks
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
