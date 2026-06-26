import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { isTimesheetingEnabled, getAppSettings } from "@/lib/settings/service";
import { getClient } from "@/lib/clients/queries";
import { listClients } from "@/lib/clients/queries";
import { listClientReportEntries } from "@/lib/timesheets/queries";
import { formatMinutes } from "@/lib/timesheets/meta";
import { formatMoneyCents } from "@/lib/contracts/meta";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { relationLabel } from "@/components/timesheets/entry-context";
import { ReportControls } from "./report-controls";

type SP = { clientId?: string; month?: string };

const pad = (n: number) => `${n}`.padStart(2, "0");

function amountCents(e: { billable: boolean; minutes: number; hourlyRateCents: number | null }): number {
  if (!e.billable || e.hourlyRateCents == null) return 0;
  return Math.round((e.minutes / 60) * e.hourlyRateCents);
}

export default async function TimesheetReportPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requirePermission("timesheets.read.all");
  if (!(await isTimesheetingEnabled())) notFound();
  const sp = await searchParams;

  const now = new Date();
  const monthStr = sp.month && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const [y, m] = monthStr.split("-").map(Number);
  const from = new Date(y, m - 1, 1);
  const to = new Date(y, m, 1);
  const periodLabel = from.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const clientId = sp.clientId ?? "";
  const [clients, settings, client, entries] = await Promise.all([
    listClients({}),
    getAppSettings(),
    clientId ? getClient(clientId) : Promise.resolve(null),
    clientId ? listClientReportEntries(clientId, from, to) : Promise.resolve([]),
  ]);

  const totalMinutes = entries.reduce((s, e) => s + e.minutes, 0);
  const billableMinutes = entries.reduce((s, e) => s + (e.billable ? e.minutes : 0), 0);
  const totalAmount = entries.reduce((s, e) => s + amountCents(e), 0);

  return (
    <div className="space-y-6">
      <div className="no-print">
        <Breadcrumbs items={[{ label: "Timesheets", href: "/timesheets" }, { label: "Report" }]} />
      </div>
      <div className="no-print flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Client timesheet report</h1>
      </div>

      <Card className="no-print">
        <CardContent>
          <ReportControls
            clients={clients.map((c) => ({ id: c.id, companyName: c.companyName }))}
            clientId={clientId}
            month={monthStr}
            defaultEmail={client?.contactEmail ?? ""}
          />
        </CardContent>
      </Card>

      {!clientId || !client ? (
        <p className="no-print text-[var(--muted-foreground)]">Select a client to generate the report.</p>
      ) : (
        <div className="print-area rounded-[var(--radius)] border border-[var(--border)] p-8">
          <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
            <div>
              <p className="text-lg font-semibold">{settings.companyName}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Timesheet report</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-medium">{client.companyName}</p>
              <p className="text-[var(--muted-foreground)]">{periodLabel}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Total time</p>
              <p className="text-xl font-semibold">{formatMinutes(totalMinutes)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Billable time</p>
              <p className="text-xl font-semibold">{formatMinutes(billableMinutes)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Billable amount</p>
              <p className="text-xl font-semibold">{formatMoneyCents(totalAmount)}</p>
            </div>
          </div>

          {entries.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--muted-foreground)]">No time logged for this client in {periodLabel}.</p>
          ) : (
            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 text-xs font-medium uppercase tracking-wide">Date</th>
                  <th scope="col" className="py-2 pr-3 text-xs font-medium uppercase tracking-wide">Who</th>
                  <th scope="col" className="py-2 pr-3 text-xs font-medium uppercase tracking-wide">Work</th>
                  <th scope="col" className="py-2 pr-3 text-xs font-medium uppercase tracking-wide">Duration</th>
                  <th scope="col" className="py-2 pr-3 text-right text-xs font-medium uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-[var(--border)]">
                    <td className="py-2 pr-3 whitespace-nowrap">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{e.user.firstName} {e.user.lastName}</td>
                    <td className="py-2 pr-3">
                      {relationLabel(e)}
                      {e.description ? <span className="text-[var(--muted-foreground)]"> — {e.description}</span> : null}
                      {!e.billable ? <span className="text-[var(--muted-foreground)]"> (non-billable)</span> : null}
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap">{formatMinutes(e.minutes)}</td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">{formatMoneyCents(amountCents(e))}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="py-2 pr-3" colSpan={3}>Total</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{formatMinutes(totalMinutes)}</td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap">{formatMoneyCents(totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          )}

          <p className="mt-8 text-xs text-[var(--muted-foreground)]">
            Generated by {settings.companyName} — amounts exclude taxes. Rejected entries are not included.
          </p>
        </div>
      )}
    </div>
  );
}
