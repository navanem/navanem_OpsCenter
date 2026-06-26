"use client";

import { useRef } from "react";

// A select bound to a server action; auto-submits on change. Reused for visits/tasks.
export function QuickAssign({
  action,
  hidden,
  currentId,
  options,
}: {
  action: (formData: FormData) => void | Promise<void>;
  hidden: Record<string, string>;
  currentId: string;
  options: { id: string; label: string }[];
}) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form action={action} ref={ref}>
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <select
        name="assigneeId"
        defaultValue={currentId}
        onChange={() => ref.current?.requestSubmit()}
        className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--card)] px-1.5 py-1 text-xs"
      >
        <option value="">Unassigned</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </form>
  );
}
