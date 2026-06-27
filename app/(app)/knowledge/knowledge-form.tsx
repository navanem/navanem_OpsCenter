"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";
import type { ArticleFormState } from "./actions";

type Action = (state: ArticleFormState, formData: FormData) => Promise<ArticleFormState>;

export interface ArticleDefaults {
  id?: string;
  title?: string;
  body?: string;
  excerpt?: string | null;
  categoryId?: string | null;
  status?: "DRAFT" | "PUBLISHED";
  visibleToPortal?: boolean;
}

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

export function KnowledgeForm({
  action,
  categories,
  defaults,
  submitLabel,
}: {
  action: Action;
  categories: { id: string; name: string }[];
  defaults?: ArticleDefaults;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as ArticleFormState);
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
          <label htmlFor="categoryId" className="text-sm text-[var(--muted-foreground)]">{t.common.category}</label>
          <select id="categoryId" name="categoryId" defaultValue={defaults?.categoryId ?? ""} className={inputClass}>
            <option value="">{t.knowledge.uncategorized}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-sm text-[var(--muted-foreground)]">{t.common.status}</label>
          <select id="status" name="status" defaultValue={defaults?.status ?? "DRAFT"} className={inputClass}>
            <option value="DRAFT">{t.knowledge.draft}</option>
            <option value="PUBLISHED">{t.knowledge.published}</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="excerpt" className="text-sm text-[var(--muted-foreground)]">{t.form.summary}</label>
        <input id="excerpt" name="excerpt" type="text" defaultValue={defaults?.excerpt ?? ""} placeholder={t.knowledge.summaryPlaceholder} className={inputClass} />
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="visibleToPortal" value="on" defaultChecked={defaults?.visibleToPortal ?? false} className="mt-0.5 h-4 w-4 cursor-pointer" />
        <span>
          {t.form.visibleInPortal}
          <span className="block text-xs text-[var(--muted-foreground)]">{t.knowledge.portalHint}</span>
        </span>
      </label>

      <div className="flex flex-col gap-1">
        <label htmlFor="body" className="text-sm text-[var(--muted-foreground)]">{t.form.content} *</label>
        <textarea id="body" name="body" required rows={18} defaultValue={defaults?.body ?? ""} className={`${inputClass} font-mono text-[13px] leading-relaxed`} />
        <p className="text-xs text-[var(--muted-foreground)]">{t.knowledge.markdownHint}</p>
      </div>

      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}

      <Button type="submit" disabled={pending}>{pending ? t.common.saving : defaults?.id ? t.common.save : t.common.create}</Button>
    </form>
  );
}
