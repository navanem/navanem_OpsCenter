"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TaskPriorityBadge } from "@/components/projects/badges";
import { moveTaskAction } from "../actions";
import type { TaskPriorityKey } from "@/lib/projects/meta";

export interface BoardTask {
  id: string;
  title: string;
  statusId: string;
  priority: TaskPriorityKey;
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
  tasks: BoardTask[];
  canManage: boolean;
}

export function TaskBoard({ projectId, statuses, tasks, canManage }: Props) {
  const [items, setItems] = useState(tasks);
  const [dragId, setDragId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function onDrop(statusId: string) {
    if (!dragId || !canManage) return;
    const id = dragId;
    setDragId(null);
    setItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, statusId } : t)),
    );
    startTransition(async () => {
      await moveTaskAction(id, statusId);
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
            onDrop={() => onDrop(status.id)}
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
                  className="cursor-grab rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] p-3 text-sm shadow-sm transition hover:border-[var(--ring)] active:cursor-grabbing"
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
                  <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {task.assignee
                      ? `${task.assignee.firstName} ${task.assignee.lastName}`
                      : "Unassigned"}
                  </div>
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
