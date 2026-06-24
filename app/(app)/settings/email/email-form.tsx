"use client";

import { useActionState } from "react";
import { updateSmtpAction, sendTestEmailAction } from "./actions";
import type { SmtpState, TestState } from "./actions";
import { Button } from "@/components/ui/button";

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

interface EmailFormProps {
  settings: {
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpFrom: string;
    smtpSecure: boolean | null;
  };
}

export function EmailForm({ settings }: EmailFormProps) {
  const [smtpState, smtpFormAction, smtpPending] = useActionState<SmtpState, FormData>(
    updateSmtpAction,
    {},
  );
  const [testState, testFormAction, testPending] = useActionState<TestState, FormData>(
    sendTestEmailAction,
    {},
  );

  const secure = settings.smtpSecure ?? false;

  return (
    <div className="space-y-8">
      <form action={smtpFormAction} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label htmlFor="smtpHost" className="text-sm text-[var(--muted-foreground)]">
              SMTP host
            </label>
            <input
              id="smtpHost"
              name="smtpHost"
              type="text"
              defaultValue={settings.smtpHost}
              className={inputClass}
              placeholder="smtp.example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="smtpPort" className="text-sm text-[var(--muted-foreground)]">
              Port
            </label>
            <input
              id="smtpPort"
              name="smtpPort"
              type="text"
              inputMode="numeric"
              defaultValue={settings.smtpPort}
              className={inputClass}
              placeholder="587"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="smtpUser" className="text-sm text-[var(--muted-foreground)]">
              Username
            </label>
            <input
              id="smtpUser"
              name="smtpUser"
              type="text"
              autoComplete="off"
              defaultValue={settings.smtpUser}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label htmlFor="smtpPassword" className="text-sm text-[var(--muted-foreground)]">
              Password
            </label>
            <input
              id="smtpPassword"
              name="smtpPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Leave blank to keep current"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label htmlFor="smtpFrom" className="text-sm text-[var(--muted-foreground)]">
              From address
            </label>
            <input
              id="smtpFrom"
              name="smtpFrom"
              type="email"
              defaultValue={settings.smtpFrom}
              className={inputClass}
              placeholder="noreply@example.com"
            />
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              id="smtpSecure"
              name="smtpSecure"
              type="checkbox"
              defaultChecked={secure}
              className="h-4 w-4 rounded border-[var(--border)]"
            />
            <label htmlFor="smtpSecure" className="text-sm text-[var(--muted-foreground)]">
              Use TLS/SSL
            </label>
          </div>
        </div>

        {smtpState.error ? (
          <p className="text-sm text-[var(--destructive)]">{smtpState.error}</p>
        ) : null}
        {smtpState.ok ? (
          <p className="text-sm text-green-600">Saved.</p>
        ) : null}

        <Button type="submit" disabled={smtpPending}>
          {smtpPending ? "Saving…" : "Save SMTP settings"}
        </Button>
      </form>

      <div className="border-t border-[var(--border)] pt-6">
        <h3 className="mb-2 text-sm font-medium">Test connection</h3>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">
          A test email will be sent to your account address.
        </p>
        <form action={testFormAction} className="space-y-3">
          {testState.error ? (
            <p className="text-sm text-[var(--destructive)]">{testState.error}</p>
          ) : null}
          {testState.ok ? (
            <p className="text-sm text-green-600">Test email sent.</p>
          ) : null}
          <Button type="submit" variant="outline" disabled={testPending}>
            {testPending ? "Sending…" : "Send test email"}
          </Button>
        </form>
      </div>
    </div>
  );
}
