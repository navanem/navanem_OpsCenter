"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { ticketSchema, commentSchema } from "@/lib/validation/ticket";
import { notifyTicketEvent } from "@/lib/tickets/notify";

type TicketStatus = "OPEN" | "IN_PROGRESS" | "PENDING" | "RESOLVED" | "CLOSED";
const STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"];

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
    categoryId: formData.get("categoryId"),
    priorityId: formData.get("priorityId"),
    assigneeId: formData.get("assigneeId"),
    dueAt: formData.get("dueAt"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const [category, priority] = await Promise.all([
    prisma.ticketCategory.findUnique({ where: { id: parsed.data.categoryId } }),
    prisma.ticketPriority.findUnique({ where: { id: parsed.data.priorityId } }),
  ]);
  if (!category || !priority) {
    return { error: "Selected category or priority no longer exists." };
  }
  const assigneeId =
    parsed.data.assigneeId && parsed.data.assigneeId.length > 0
      ? parsed.data.assigneeId
      : null;
  const due = parsed.data.dueAt ? new Date(parsed.data.dueAt) : null;
  const dueAt = due && !isNaN(due.getTime()) ? due : null;
  const tagIds = formData.getAll("tags").filter((t): t is string => typeof t === "string" && t.length > 0);
  const ticket = await prisma.ticket.create({
    data: {
      subject: parsed.data.subject,
      description: parsed.data.description,
      clientId: parsed.data.clientId,
      categoryId: parsed.data.categoryId,
      priorityId: parsed.data.priorityId,
      assigneeId,
      dueAt,
      createdById: user.id,
      tags: tagIds.length > 0 ? { connect: tagIds.map((id) => ({ id })) } : undefined,
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
  await notifyTicketEvent({ ticketId, event: "status_changed", actorId: user.id, toStatus: status });
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
  const priorityId = formData.get("priorityId");
  if (
    typeof id === "string" &&
    id.length > 0 &&
    typeof priorityId === "string" &&
    priorityId.length > 0
  ) {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (ticket && ticket.priorityId !== priorityId) {
      const [oldPriority, newPriority] = await Promise.all([
        ticket.priorityId
          ? prisma.ticketPriority.findUnique({ where: { id: ticket.priorityId } })
          : Promise.resolve(null),
        prisma.ticketPriority.findUnique({ where: { id: priorityId } }),
      ]);
      if (newPriority) {
        await prisma.$transaction([
          prisma.ticket.update({
            where: { id },
            data: { priorityId },
          }),
          prisma.ticketActivity.create({
            data: {
              ticketId: id,
              actorId: user.id,
              type: "PRIORITY_CHANGED",
              fromValue: oldPriority?.name ?? null,
              toValue: newPriority.name,
            },
          }),
        ]);
      }
    }
  }
  redirect(`/tickets/${typeof id === "string" ? id : ""}`);
}

export async function updateDueDateAction(formData: FormData): Promise<void> {
  await requirePermission("tickets.manage");
  const id = formData.get("id");
  const dueRaw = formData.get("dueAt");
  if (typeof id === "string" && id.length > 0) {
    let dueAt: Date | null = null;
    if (typeof dueRaw === "string" && dueRaw.length > 0) {
      const d = new Date(dueRaw);
      dueAt = isNaN(d.getTime()) ? null : d;
    }
    await prisma.ticket.update({ where: { id }, data: { dueAt } });
    revalidatePath(`/tickets/${id}`);
    revalidatePath("/tickets");
  }
  redirect(`/tickets/${typeof id === "string" ? id : ""}`);
}

export async function updateTicketDeviceAction(formData: FormData): Promise<void> {
  await requirePermission("tickets.manage");
  const id = formData.get("id");
  const deviceRaw = formData.get("deviceId");
  if (typeof id === "string" && id.length > 0) {
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    let deviceId: string | null = null;
    if (typeof deviceRaw === "string" && deviceRaw.length > 0 && ticket) {
      // Only allow linking a device belonging to the ticket's client.
      const device = await prisma.device.findUnique({ where: { id: deviceRaw } });
      if (device && device.clientId === ticket.clientId) deviceId = device.id;
    }
    await prisma.ticket.update({ where: { id }, data: { deviceId } });
    revalidatePath(`/tickets/${id}`);
  }
  redirect(`/tickets/${typeof id === "string" ? id : ""}`);
}

export async function updateTicketTagsAction(formData: FormData): Promise<void> {
  await requirePermission("tickets.manage");
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    const tagIds = formData.getAll("tags").filter((t): t is string => typeof t === "string" && t.length > 0);
    await prisma.ticket.update({
      where: { id },
      data: { tags: { set: tagIds.map((tid) => ({ id: tid })) } },
    });
    revalidatePath(`/tickets/${id}`);
    revalidatePath("/tickets");
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
      if (assigneeId) {
        await notifyTicketEvent({ ticketId: id, event: "assigned", actorId: user.id });
      }
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
  await notifyTicketEvent({ ticketId: id, event: "commented", actorId: user.id });
  revalidatePath(`/tickets/${id}`);
  return {};
}
