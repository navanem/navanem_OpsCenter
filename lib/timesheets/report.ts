import { getClient } from "@/lib/clients/queries";
import { listClientReportEntries } from "@/lib/timesheets/queries";
import { getAppSettings } from "@/lib/settings/service";
import { formatTicketReference } from "@/lib/tickets/meta";

type ReportEntry = Awaited<ReturnType<typeof listClientReportEntries>>[number];

function workLabel(e: ReportEntry): string {
  if (e.ticket) return `${formatTicketReference(e.ticket.number)} ${e.ticket.subject}`;
  if (e.task) return e.task.title;
  if (e.visit) return e.visit.title;
  return "General";
}

function amountCents(e: ReportEntry): number {
  if (!e.billable || e.hourlyRateCents == null) return 0;
  return Math.round((e.minutes / 60) * e.hourlyRateCents);
}

export interface ReportRow {
  date: Date;
  who: string;
  work: string;
  minutes: number;
  billable: boolean;
  amountCents: number;
}

export interface ClientReport {
  companyName: string;
  clientName: string;
  periodLabel: string;
  rows: ReportRow[];
  totalMinutes: number;
  billableMinutes: number;
  totalAmountCents: number;
}

export async function buildClientReport(
  clientId: string,
  from: Date,
  to: Date,
): Promise<ClientReport | null> {
  const [client, settings, entries] = await Promise.all([
    getClient(clientId),
    getAppSettings(),
    listClientReportEntries(clientId, from, to),
  ]);
  if (!client) return null;

  const rows: ReportRow[] = entries.map((e) => ({
    date: new Date(e.date),
    who: `${e.user.firstName} ${e.user.lastName}`,
    work: workLabel(e),
    minutes: e.minutes,
    billable: e.billable,
    amountCents: amountCents(e),
  }));

  return {
    companyName: settings.companyName,
    clientName: client.companyName,
    periodLabel: from.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
    rows,
    totalMinutes: rows.reduce((s, r) => s + r.minutes, 0),
    billableMinutes: rows.reduce((s, r) => s + (r.billable ? r.minutes : 0), 0),
    totalAmountCents: rows.reduce((s, r) => s + r.amountCents, 0),
  };
}
