"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const inputClass =
  "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm";

export function ReportControls({
  clients,
  clientId,
  month,
}: {
  clients: { id: string; companyName: string }[];
  clientId: string;
  month: string;
}) {
  const router = useRouter();

  function update(key: "clientId" | "month", value: string) {
    const params = new URLSearchParams();
    const merged = { clientId, month, [key]: value };
    if (merged.clientId) params.set("clientId", merged.clientId);
    if (merged.month) params.set("month", merged.month);
    router.push(`/timesheets/reports?${params.toString()}`);
  }

  return (
    <div className="no-print flex flex-wrap items-end gap-3">
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
      <Button type="button" onClick={() => window.print()} disabled={!clientId}>
        Save as PDF
      </Button>
    </div>
  );
}
