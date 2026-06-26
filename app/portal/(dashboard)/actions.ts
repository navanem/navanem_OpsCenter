"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireContact } from "@/lib/portal/current-contact";
import { clearPortalSessionCookie } from "@/lib/portal/session";

export interface PortalTicketState {
  error?: string;
}

const ticketSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required"),
  description: z.string().trim().min(1, "Description is required"),
  priorityId: z.string().trim().min(1, "Priority is required"),
});

export async function createPortalTicketAction(
  _prev: PortalTicketState,
  formData: FormData,
): Promise<PortalTicketState> {
  const contact = await requireContact();
  const parsed = ticketSchema.safeParse({
    subject: formData.get("subject"),
    description: formData.get("description"),
    priorityId: formData.get("priorityId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const [category, priority] = await Promise.all([
    prisma.ticketCategory.findFirst({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.ticketPriority.findUnique({ where: { id: parsed.data.priorityId } }),
  ]);
  if (!category) return { error: "Ticketing is not available. Please contact support directly." };
  if (!priority) return { error: "Selected priority is no longer available." };

  const ticket = await prisma.ticket.create({
    data: {
      subject: parsed.data.subject,
      description: parsed.data.description,
      clientId: contact.clientId,
      categoryId: category.id,
      priorityId: priority.id,
      createdByContactId: contact.id,
      status: "OPEN",
    },
  });
  revalidatePath("/portal");
  redirect(`/portal/tickets/${ticket.id}`);
}

export async function addPortalCommentAction(
  _prev: PortalTicketState,
  formData: FormData,
): Promise<PortalTicketState> {
  const contact = await requireContact();
  const ticketId = formData.get("ticketId");
  const body = formData.get("body");
  if (typeof ticketId !== "string" || ticketId.length === 0) return { error: "Missing ticket." };
  if (typeof body !== "string" || body.trim().length === 0) return { error: "Comment cannot be empty." };

  // Ensure the ticket belongs to the contact's client.
  const ticket = await prisma.ticket.findFirst({ where: { id: ticketId, clientId: contact.clientId } });
  if (!ticket) return { error: "Ticket not found." };

  await prisma.ticketComment.create({
    data: { ticketId, authorContactId: contact.id, body: body.trim() },
  });
  revalidatePath(`/portal/tickets/${ticketId}`);
  return {};
}

export async function portalSignOutAction(): Promise<void> {
  await clearPortalSessionCookie();
  redirect("/portal/login");
}
