"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { emailReportAction, type EmailReportState } from "./actions";

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm";

export function ReportControls({
  clients,
  clientId,
  month,
  defaultEmail,
}: {
  clients: { id: string; companyName: string }[];
  clientId: string;
  month: string;
  defaultEmail: string;
}) {
  const router = useRouter();
  const [emailState, emailAction, emailPending] = useActionState<EmailReportState, FormData>(
    emailReportAction,
    {},
  );

  function update(key: "clientId" | "month", value: string) {
    const params = new URLSearchParams();
    const merged = { clientId, month, [key]: value };
    if (merged.clientId) params.set("clientId", merged.clientId);
    if (merged.month) params.set("month", merged.month);
    router.push(`/timesheets/reports?${params.toString()}`);
  }

  const pdfHref = `/api/timesheets/report?clientId=${encodeURIComponent(clientId)}&month=${encodeURIComponent(month)}`;

  return (
    <div className="no-print space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="r-client" className="text-xs text-[var(--muted-foreground)]">Client</label>
          <select id="r-client" value={clientId} onChange={(e) => update("clientId", e.target.value)} className={inputClass}>
            <option value="">Select a client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="r-month" className="text-xs text-[var(--muted-foreground)]">Month</label>
          <input id="r-month" type="month" value={month} onChange={(e) => update("month", e.target.value)} className={inputClass} />
        </div>
        {clientId ? (
          <a href={pdfHref}>
            <Button type="button">Download PDF</Button>
          </a>
        ) : (
          <Button type="button" disabled>Download PDF</Button>
        )}
        <Button type="button" variant="outline" onClick={() => window.print()} disabled={!clientId}>
          Print
        </Button>
      </div>

      {clientId ? (
        <form action={emailAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="month" value={month} />
          <div className="flex flex-col gap-1">
            <label htmlFor="r-email" className="text-xs text-[var(--muted-foreground)]">Email the PDF to</label>
            <input id="r-email" name="to" type="email" required defaultValue={defaultEmail} placeholder="client@example.com" className={`${inputClass} w-64`} />
          </div>
          <Button type="submit" variant="outline" disabled={emailPending}>
            {emailPending ? "Sending…" : "Email report"}
          </Button>
          {emailState.error ? <p className="text-sm text-[var(--destructive)]">{emailState.error}</p> : null}
          {emailState.ok ? <p className="text-sm text-green-600">Sent.</p> : null}
        </form>
      ) : null}
    </div>
  );
}
