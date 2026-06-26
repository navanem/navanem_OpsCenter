"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { ArticleFormState } from "./actions";

type Action = (state: ArticleFormState, formData: FormData) => Promise<ArticleFormState>;

export interface ArticleDefaults {
  id?: string;
  title?: string;
  body?: string;
  excerpt?: string | null;
  categoryId?: string | null;
  status?: "DRAFT" | "PUBLISHED";
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
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as ArticleFormState);

  return (
    <form action={formAction} className="space-y-6">
      {defaults?.id ? <input type="hidden" name="id" value={defaults.id} /> : null}

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm text-[var(--muted-foreground)]">Title *</label>
        <input id="title" name="title" type="text" required defaultValue={defaults?.title ?? ""} className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="categoryId" className="text-sm text-[var(--muted-foreground)]">Category</label>
          <select id="categoryId" name="categoryId" defaultValue={defaults?.categoryId ?? ""} className={inputClass}>
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-sm text-[var(--muted-foreground)]">Status</label>
          <select id="status" name="status" defaultValue={defaults?.status ?? "DRAFT"} className={inputClass}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="excerpt" className="text-sm text-[var(--muted-foreground)]">Summary</label>
        <input id="excerpt" name="excerpt" type="text" defaultValue={defaults?.excerpt ?? ""} placeholder="One-line description shown in the list" className={inputClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="body" className="text-sm text-[var(--muted-foreground)]">Content *</label>
        <textarea id="body" name="body" required rows={18} defaultValue={defaults?.body ?? ""} className={`${inputClass} font-mono text-[13px] leading-relaxed`} />
        <p className="text-xs text-[var(--muted-foreground)]">Markdown supported — headings (#), lists, **bold**, `code`, tables, links.</p>
      </div>

      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}

      <Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button>
    </form>
  );
}
