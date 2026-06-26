import { prisma } from "@/lib/db";
import { isSmtpConfigured, sendMail } from "@/lib/mailer";
import { getAppSettings } from "@/lib/settings/service";
import { formatTicketReference } from "@/lib/tickets/meta";

type TicketEvent = "assigned" | "commented" | "status_changed";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function appBaseUrl(): string {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

// Best-effort email notification for a ticket event. Never throws into the caller:
// no-ops when SMTP is unconfigured, and swallows delivery errors.
export async function notifyTicketEvent(opts: {
  ticketId: string;
  event: TicketEvent;
  actorId: string;
  toStatus?: string;
}): Promise<void> {
  try {
    if (!(await isSmtpConfigured())) return;
    const ticket = await prisma.ticket.findUnique({
      where: { id: opts.ticketId },
      include: { assignee: true, createdBy: true },
    });
    if (!ticket) return;

    const settings = await getAppSettings();
    const ref = formatTicketReference(ticket.number);
    const link = `${appBaseUrl()}/tickets/${ticket.id}`;

    // Recipients: assignee always; creator too (except for a pure assignment). Never the actor.
    const recipients = new Set<string>();
    const consider = (u: { id: string; email: string; status: string } | null) => {
      if (u && u.id !== opts.actorId && u.email && u.status === "ACTIVE") recipients.add(u.email);
    };
    consider(ticket.assignee);
    if (opts.event !== "assigned") consider(ticket.createdBy);
    if (recipients.size === 0) return;

    let subject: string;
    let intro: string;
    if (opts.event === "assigned") {
      subject = `${ref} assigned to you`;
      intro = `You have been assigned ticket ${ref}.`;
    } else if (opts.event === "commented") {
      subject = `New comment on ${ref}`;
      intro = `A new comment was added to ticket ${ref}.`;
    } else {
      subject = `${ref} status changed`;
      intro = `Ticket ${ref} status changed${opts.toStatus ? ` to ${escapeHtml(opts.toStatus)}` : ""}.`;
    }

    const html = `<p>${intro}</p><p><strong>${escapeHtml(ticket.subject)}</strong></p><p><a href="${link}">View ticket</a></p><p>— ${escapeHtml(settings.companyName)}</p>`;
    const text = `${intro}\n${ticket.subject}\n${link}`;

    for (const to of recipients) {
      await sendMail({ to, subject: `[${ref}] ${subject}`, html, text });
    }
  } catch (e) {
    console.error("ticket notification failed", e);
  }
}
