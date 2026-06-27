"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";
import type { ProblemFormState } from "./actions";

type Action = (state: ProblemFormState, formData: FormData) => Promise<ProblemFormState>;

export interface ProblemDefaults {
  id?: string;
  title?: string;
  description?: string | null;
  typeId?: string | null;
  statusId?: string;
  clientId?: string | null;
  assigneeId?: string | null;
  priority?: string | null;
  impact?: string | null;
  rootCause?: string | null;
  workaround?: string | null;
  resolution?: string | null;
  knownError?: boolean;
}

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

export function ProblemForm({
  action,
  clients,
  technicians,
  types,
  statuses,
  defaults,
}: {
  action: Action;
  clients: { id: string; companyName: string }[];
  technicians: { id: string; firstName: string; lastName: string }[];
  types: { id: string; name: string }[];
  statuses: { id: string; name: string }[];
  defaults?: ProblemDefaults;
}) {
  const [state, formAction, pending] = useActionState(action, {} as ProblemFormState);
  const t = useT();

  return (
    <form action={formAction} className="space-y-6">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm text-[var(--muted-foreground)]">{t.common.title} *</label>
        <input id="title" name="title" type="text" required defaultValue={defaults?.title ?? ""} className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="typeId" className="text-sm text-[var(--muted-foreground)]">{t.common.type}</label>
          <select id="typeId" name="typeId" defaultValue={defaults?.typeId ?? ""} className={inputClass}>
            <option value="">{t.common.none}</option>
            {types.map((ty) => <option key={ty.id} value={ty.id}>{ty.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="statusId" className="text-sm text-[var(--muted-foreground)]">{t.common.status} *</label>
          <select id="statusId" name="statusId" required defaultValue={defaults?.statusId ?? ""} className={inputClass}>
            <option value="" disabled>{t.form.selectStatus}</option>
            {statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="clientId" className="text-sm text-[var(--muted-foreground)]">{t.common.client}</label>
          <select id="clientId" name="clientId" defaultValue={defaults?.clientId ?? ""} className={inputClass}>
            <option value="">{t.form.unassignedInternal}</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="assigneeId" className="text-sm text-[var(--muted-foreground)]">{t.common.assignee}</label>
          <select id="assigneeId" name="assigneeId" defaultValue={defaults?.assigneeId ?? ""} className={inputClass}>
            <option value="">{t.common.unassigned}</option>
            {technicians.map((tech) => <option key={tech.id} value={tech.id}>{tech.firstName} {tech.lastName}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="priority" className="text-sm text-[var(--muted-foreground)]">{t.problems.priority}</label>
          <select id="priority" name="priority" defaultValue={defaults?.priority ?? ""} className={inputClass}>
            <option value="">{t.common.none}</option>
            <option value="LOW">{t.problems.priorityLow}</option>
            <option value="MEDIUM">{t.problems.priorityMedium}</option>
            <option value="HIGH">{t.problems.priorityHigh}</option>
            <option value="CRITICAL">{t.problems.priorityCritical}</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="impact" className="text-sm text-[var(--muted-foreground)]">{t.problems.impact}</label>
          <input id="impact" name="impact" type="text" defaultValue={defaults?.impact ?? ""} className={inputClass} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="knownError" value="true" defaultChecked={defaults?.knownError ?? false} className="h-4 w-4 cursor-pointer" style={{ accentColor: "var(--primary)" }} />
        {t.problems.knownError}
      </label>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm text-[var(--muted-foreground)]">{t.common.description}</label>
        <textarea id="description" name="description" rows={3} defaultValue={defaults?.description ?? ""} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="rootCause" className="text-sm text-[var(--muted-foreground)]">{t.problems.rootCause}</label>
        <textarea id="rootCause" name="rootCause" rows={3} defaultValue={defaults?.rootCause ?? ""} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="workaround" className="text-sm text-[var(--muted-foreground)]">{t.problems.workaround}</label>
        <textarea id="workaround" name="workaround" rows={3} defaultValue={defaults?.workaround ?? ""} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="resolution" className="text-sm text-[var(--muted-foreground)]">{t.problems.resolution}</label>
        <textarea id="resolution" name="resolution" rows={3} defaultValue={defaults?.resolution ?? ""} className={inputClass} />
        <p className="text-xs text-[var(--muted-foreground)]">{t.problems.resolutionHint}</p>
      </div>

      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? t.common.saving : defaults?.id ? t.common.save : t.common.create}</Button>
    </form>
  );
}
