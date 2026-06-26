"use client";

import { useRef } from "react";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/config";

// Auto-submitting locale picker.
export function LanguageSelect({
  action,
  current,
}: {
  action: (formData: FormData) => void | Promise<void>;
  current: string;
}) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form action={action} ref={ref}>
      <select
        name="locale"
        defaultValue={current}
        onChange={() => ref.current?.requestSubmit()}
        className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {LOCALE_LABELS[l]}
          </option>
        ))}
      </select>
    </form>
  );
}
