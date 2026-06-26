"use client";

import { useActionState } from "react";
import { updateTimesheetSettingsAction, type ModuleSettingsState } from "./actions";
import { Button } from "@/components/ui/button";

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

export function TimesheetSettingsForm({
  enabled,
  defaultHourlyRate,
}: {
  enabled: boolean;
  defaultHourlyRate: string;
}) {
  const [state, formAction, pending] = useActionState<ModuleSettingsState, FormData>(
    updateTimesheetSettingsAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-6">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="timesheetingEnabled" value="true" defaultChecked={enabled} className="h-4 w-4 cursor-pointer" />
        Enable timesheeting
      </label>
      <p className="-mt-4 text-xs text-[var(--muted-foreground)]">
        Adds time tracking across tickets, project tasks, and visits, with a submit/approve workflow. When disabled, the module is hidden everywhere.
      </p>

      <div className="flex flex-col gap-1">
        <label htmlFor="defaultHourlyRate" className="text-sm text-[var(--muted-foreground)]">Default hourly rate</label>
        <input id="defaultHourlyRate" name="defaultHourlyRate" type="text" inputMode="decimal" placeholder="e.g. 120.00" defaultValue={defaultHourlyRate} className={`${inputClass} w-48`} />
        <p className="text-xs text-[var(--muted-foreground)]">
          Fallback rate applied to new time entries when no contract type rate applies. Leave empty for none.
        </p>
      </div>

      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-green-600">Saved.</p> : null}

      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
    </form>
  );
}
