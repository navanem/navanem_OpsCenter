import { getCurrentUser } from "@/lib/auth/current-user";
import { can } from "@/lib/rbac/can";
import { isTimesheetingEnabled } from "@/lib/settings/service";
import { buildClientReport } from "@/lib/timesheets/report";
import { buildTimesheetReportPdf } from "@/lib/timesheets/report-pdf";

export async function GET(request: Request): Promise<Response> {
  const user = await getCurrentUser();
  if (!user || !can(user, "timesheets.read.all")) {
    return new Response("Forbidden", { status: 403 });
  }
  if (!(await isTimesheetingEnabled())) {
    return new Response("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const clientId = url.searchParams.get("clientId");
  const month = url.searchParams.get("month");
  if (!clientId || !month || !/^\d{4}-\d{2}$/.test(month)) {
    return new Response("Bad request", { status: 400 });
  }

  const [y, m] = month.split("-").map(Number);
  const report = await buildClientReport(clientId, new Date(y, m - 1, 1), new Date(y, m, 1));
  if (!report) {
    return new Response("Not found", { status: 404 });
  }

  const pdf = await buildTimesheetReportPdf(report);
  const safeName = report.clientName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="timesheet-${safeName}-${month}.pdf"`,
    },
  });
}
