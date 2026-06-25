"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { TASK_PRIORITIES, TASK_PRIORITY_META } from "@/lib/projects/meta";
import type { TaskFormState } from "../actions";

type Action = (
  state: TaskFormState,
  formData: FormData,
) => Promise<TaskFormState>;

interface TaskStatus {
  id: string;
  name: string;
}

interface Technician {
  id: string;
  firstName: string;
  lastName: string;
}

export interface TaskDefaults {
  id?: string;
  projectId?: string;
  title?: string;
  description?: string | null;
  statusId?: string;
  assigneeId?: string | null;
  priority?: string;
  startDate?: Date | string | null;
  dueDate?: Date | string | null;
}

interface Props {
  action: Action;
  projectId: string;
  statuses: TaskStatus[];
  technicians: Technician[];
  defaults?: TaskDefaults;
  submitLabel: string;
}

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

function toDateString(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export function TaskForm({
  action,
  projectId,
  statuses,
  technicians,
  defaults,
  submitLabel,
}: Props) {
  const [state, formAction, pending] = useActionState(
    action,
    {} as TaskFormState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {defaults?.id ? (
        <input type="hidden" name="id" value={defaults.id} />
      ) : null}
      <input type="hidden" name="projectId" value={projectId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="title" className="text-sm text-[var(--muted-foreground)]">
            Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={defaults?.title ?? ""}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="statusId" className="text-sm text-[var(--muted-foreground)]">
            Status
          </label>
          <select
            id="statusId"
            name="statusId"
            defaultValue={defaults?.statusId ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Select a status
            </option>
            {statuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="priority" className="text-sm text-[var(--muted-foreground)]">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={defaults?.priority ?? "MEDIUM"}
            className={inputClass}
          >
            {TASK_PRIORITIES.map((key) => (
              <option key={key} value={key}>
                {TASK_PRIORITY_META[key].label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="assigneeId" className="text-sm text-[var(--muted-foreground)]">
            Assignee
          </label>
          <select
            id="assigneeId"
            name="assigneeId"
            defaultValue={defaults?.assigneeId ?? ""}
            className={inputClass}
          >
            <option value="">Unassigned</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.firstName} {t.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="startDate" className="text-sm text-[var(--muted-foreground)]">
            Start date
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={toDateString(defaults?.startDate)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="dueDate" className="text-sm text-[var(--muted-foreground)]">
            Due date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={toDateString(defaults?.dueDate)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm text-[var(--muted-foreground)]">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={defaults?.description ?? ""}
          className={inputClass}
        />
      </div>

      {state.error ? (
        <p className="text-sm text-[var(--destructive)]">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
