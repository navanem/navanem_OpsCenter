"use server";

import { z } from "zod";
import { requirePermission } from "@/lib/auth/guard";
import { isTimesheetingEnabled, getAppSettings } from "@/lib/settings/service";
import { isSmtpConfigured, sendMail } from "@/lib/mailer";
import { buildClientReport } from "@/lib/timesheets/report";
import { buildTimesheetReportPdf } from "@/lib/timesheets/report-pdf";

export interface EmailReportState {
  ok?: boolean;
  error?: string;
}

export async function emailReportAction(
  _prev: EmailReportState,
  formData: FormData,
): Promise<EmailReportState> {
  await requirePermission("timesheets.read.all");
  if (!(await isTimesheetingEnabled())) return { error: "Timesheeting is disabled." };
  if (!(await isSmtpConfigured())) return { error: "SMTP is not configured (Settings → Email)." };

  const clientId = formData.get("clientId");
  const month = formData.get("month");
  const to = formData.get("to");
  if (typeof clientId !== "string" || typeof month !== "string" || !/^\d{4}-\d{2}$/.test(month)) {
    return { error: "Missing report parameters." };
  }
  const email = z.string().trim().email().safeParse(to);
  if (!email.success) return { error: "Enter a valid recipient email." };

  const [y, m] = month.split("-").map(Number);
  const report = await buildClientReport(clientId, new Date(y, m - 1, 1), new Date(y, m, 1));
  if (!report) return { error: "Client not found." };

  const pdf = await buildTimesheetReportPdf(report);
  const settings = await getAppSettings();
  try {
    await sendMail({
      to: email.data,
      subject: `Timesheet report — ${report.clientName} — ${report.periodLabel}`,
      html: `<p>Please find attached the timesheet report for <strong>${report.clientName}</strong> (${report.periodLabel}).</p><p>— ${settings.companyName}</p>`,
      text: `Timesheet report for ${report.clientName} (${report.periodLabel}). Attached as PDF.`,
      attachments: [
        { filename: `timesheet-${month}.pdf`, content: Buffer.from(pdf), contentType: "application/pdf" },
      ],
    });
  } catch (e) {
    console.error("email report failed", e);
    return { error: "Failed to send the email." };
  }
  return { ok: true };
}
