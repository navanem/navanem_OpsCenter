"use client";

import { useRef } from "react";

const fieldClass =
  "w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--muted)] px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

type Action = (formData: FormData) => void | Promise<void>;

function Hidden({ hidden }: { hidden: Record<string, string> }) {
  return (
    <>
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
    </>
  );
}

// Auto-submitting select — no separate "Update" button.
export function InlineSelect({
  action,
  name,
  hidden,
  defaultValue,
  options,
  emptyLabel,
}: {
  action: Action;
  name: string;
  hidden: Record<string, string>;
  defaultValue: string;
  options: { value: string; label: string }[];
  emptyLabel?: string;
}) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form action={action} ref={ref}>
      <Hidden hidden={hidden} />
      <select
        name={name}
        defaultValue={defaultValue}
        onChange={() => ref.current?.requestSubmit()}
        className={fieldClass}
      >
        {emptyLabel !== undefined ? <option value="">{emptyLabel}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </form>
  );
}

// Auto-submitting datetime-local.
export function InlineDate({
  action,
  name,
  hidden,
  defaultValue,
}: {
  action: Action;
  name: string;
  hidden: Record<string, string>;
  defaultValue: string;
}) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form action={action} ref={ref}>
      <Hidden hidden={hidden} />
      <input
        type="datetime-local"
        name={name}
        defaultValue={defaultValue}
        onChange={() => ref.current?.requestSubmit()}
        className={fieldClass}
      />
    </form>
  );
}

// Tag toggles rendered as chips; each toggle auto-submits the whole set.
export function InlineTags({
  action,
  hidden,
  allTags,
  selectedIds,
}: {
  action: Action;
  hidden: Record<string, string>;
  allTags: { id: string; name: string; color: string }[];
  selectedIds: string[];
}) {
  const ref = useRef<HTMLFormElement>(null);
  const selected = new Set(selectedIds);
  return (
    <form action={action} ref={ref} className="flex flex-wrap gap-1.5">
      <Hidden hidden={hidden} />
      {allTags.map((tag) => (
        <label
          key={tag.id}
          className="cursor-pointer"
          style={{ color: tag.color }}
        >
          <input
            type="checkbox"
            name="tags"
            value={tag.id}
            defaultChecked={selected.has(tag.id)}
            onChange={() => ref.current?.requestSubmit()}
            className="peer sr-only"
          />
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium opacity-50 transition peer-checked:opacity-100"
            style={{ borderColor: `${tag.color}55`, backgroundColor: `${tag.color}1a` }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
            {tag.name}
          </span>
        </label>
      ))}
    </form>
  );
}
