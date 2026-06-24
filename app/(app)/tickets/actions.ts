"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { ticketSchema, commentSchema } from "@/lib/validation/ticket";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "PENDING" | "RESOLVED" | "CLOSED";
type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
const STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"];
const PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export interface TicketFormState {
  error?: string;
}
export interface CommentState {
  error?: string;
}

export async function createTicketAction(
  _prev: TicketFormState,
  formData: FormData,
): Promise<TicketFormState> {
  const user = await requirePermission("tickets.manage");
  const parsed = ticketSchema.safeParse({
    subject: formData.get("subject"),
    description: formData.get("description"),
    clientId: formData.get("clientId"),
    priority: formData.get("priority"),
    category: formData.get("category"),
    assigneeId: formData.get("assigneeId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const assigneeId =
    parsed.data.assigneeId && parsed.data.assigneeId.length > 0
      ? parsed.data.assigneeId
      : null;
  const ticket = await prisma.ticket.create({
    data: {
      subject: parsed.data.subject,
      description: parsed.data.description,
      clientId: parsed.data.clientId,
      priority: parsed.data.priority,
      category: parsed.data.category,
      assigneeId,
      createdById: user.id,
      activities: { create: { type: "CREATED", actorId: user.id } },
    },
  });
  revalidatePath("/tickets");
  redirect(`/tickets/${ticket.id}`);
}

export async function moveTicketAction(
  ticketId: string,
  status: string,
): Promise<void> {
  const user = await requirePermission("tickets.manage");
  if (!STATUSES.includes(status as TicketStatus)) return;
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket || ticket.status === status) return;
  await prisma.$transaction([
    prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: status as TicketStatus,
        closedAt: status === "CLOSED" ? new Date() : null,
      },
    }),
    prisma.ticketActivity.create({
      data: {
        ticketId,
        actorId: user.id,
        type: "STATUS_CHANGED",
        fromValue: ticket.status,
        toValue: status,
      },
    }),
  ]);
  revalidatePath("/tickets");
  revalidatePath(`/tickets/${ticketId}`);
}

export async function updateStatusAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || typeof status !== "string") {
    redirect("/tickets");
  }
  await moveTicketAction(id, status);
  redirect(`/tickets/${id}`);
}

export async function updatePriorityAction(formData: FormData): Promise<void> {
  const user = await requirePermission("tickets.manage");
  const id = formData.get("id");
  const priority = formData.get("priority");
  if (
    typeof id === "string" &&
    id.length > 0 &&
    typeof priority === "string" &&
    PRIORITIES.includes(priority as TicketPriority)
  ) {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (ticket && ticket.priority !== priority) {
      await prisma.$transaction([
        prisma.ticket.update({
          where: { id },
          data: { priority: priority as TicketPriority },
        }),
        prisma.ticketActivity.create({
          data: {
            ticketId: id,
            actorId: user.id,
            type: "PRIORITY_CHANGED",
            fromValue: ticket.priority,
            toValue: priority,
          },
        }),
      ]);
    }
  }
  redirect(`/tickets/${typeof id === "string" ? id : ""}`);
}

export async function assignTicketAction(formData: FormData): Promise<void> {
  const user = await requirePermission("tickets.assign");
  const id = formData.get("id");
  const assigneeRaw = formData.get("assigneeId");
  const assigneeId =
    typeof assigneeRaw === "string" && assigneeRaw.length > 0
      ? assigneeRaw
      : null;
  if (typeof id === "string" && id.length > 0) {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (ticket && ticket.assigneeId !== assigneeId) {
      await prisma.$transaction([
        prisma.ticket.update({ where: { id }, data: { assigneeId } }),
        prisma.ticketActivity.create({
          data: {
            ticketId: id,
            actorId: user.id,
            type: assigneeId ? "ASSIGNED" : "UNASSIGNED",
            fromValue: ticket.assigneeId,
            toValue: assigneeId,
          },
        }),
      ]);
    }
  }
  redirect(`/tickets/${typeof id === "string" ? id : ""}`);
}

export async function addCommentAction(
  _prev: CommentState,
  formData: FormData,
): Promise<CommentState> {
  const user = await requirePermission("tickets.manage");
  const id = formData.get("ticketId");
  if (typeof id !== "string" || id.length === 0) {
    return { error: "Missing ticket id." };
  }
  const parsed = commentSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  await prisma.$transaction([
    prisma.ticketComment.create({
      data: { ticketId: id, authorId: user.id, body: parsed.data.body },
    }),
    prisma.ticketActivity.create({
      data: { ticketId: id, actorId: user.id, type: "COMMENTED" },
    }),
  ]);
  revalidatePath(`/tickets/${id}`);
  return {};
}
