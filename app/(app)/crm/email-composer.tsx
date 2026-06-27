"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/provider";

interface EmailState {
  error?: string;
  ok?: boolean;
}

type Action = (state: EmailState, formData: FormData) => Promise<EmailState>;

const inputClass =
  "w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

export function EmailComposer({ action, id, to }: { action: Action; id: string; to: string }) {
  const [state, formAction, pending] = useActionState(action, {} as EmailState);
  const t = useT();

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <p className="text-xs text-[var(--muted-foreground)]">{t.crm.emailTo}: <span className="font-medium text-[var(--foreground)]">{to}</span></p>
      <input name="subject" type="text" required placeholder={t.crm.emailSubject} className={inputClass} />
      <textarea name="body" rows={4} required placeholder={t.crm.emailBody} className={inputClass} />
      {state.error ? <p className="text-sm text-[var(--destructive)]">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-green-600">{t.crm.emailSent}</p> : null}
      <Button type="submit" size="sm" disabled={pending}>{pending ? t.common.saving : t.crm.sendEmail}</Button>
    </form>
  );
}
