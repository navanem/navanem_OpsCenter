"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { isTimesheetingEnabled, getAppSettings } from "@/lib/settings/service";
import { getClientActiveContract } from "@/lib/contracts/queries";
import type { PermissionKey } from "@/lib/rbac/permissions";
import { timeEntrySchema, normalizeTimeEntryInput } from "@/lib/validation/timesheet";

export interface TimeEntryFormState {
  error?: string;
}

async function requireTimesheeting(permission: PermissionKey = "timesheets.read") {
  const user = await requirePermission(permission);
  if (!(await isTimesheetingEnabled())) redirect("/dashboard");
  return user;
}

// Derive the owning client from the linked entity so reporting by client works.
async function resolveClientId(links: {
  ticketId: string | null;
  taskId: string | null;
  visitId: string | null;
  clientId: string | null;
}): Promise<string | null> {
  if (links.ticketId) {
    const t = await prisma.ticket.findUnique({ where: { id: links.ticketId }, select: { clientId: true } });
    return t?.clientId ?? null;
  }
  if (links.taskId) {
    const t = await prisma.projectTask.findUnique({
      where: { id: links.taskId },
      select: { project: { select: { clientId: true } } },
    });
    return t?.project.clientId ?? null;
  }
  if (links.visitId) {
    const v = await prisma.visit.findUnique({ where: { id: links.visitId }, select: { clientId: true } });
    return v?.clientId ?? null;
  }
  return links.clientId ?? null;
}

// When no rate is entered, inherit it from the client's active contract type,
// then fall back to the global default rate in settings.
async function resolveRate(current: number | null, clientId: string | null): Promise<number | null> {
  if (current != null) return current;
  if (clientId) {
    const contract = await getClientActiveContract(clientId);
    const rate = contract?.type.defaultHourlyRateCents;
    if (rate != null) return rate;
  }
  const settings = await getAppSettings();
  return settings.defaultHourlyRateCents ?? null;
}

function safeRedirect(formData: FormData): string {
  const to = formData.get("redirectTo");
  return typeof to === "string" && to.startsWith("/") ? to : "/timesheets";
}

function parseForm(formData: FormData) {
  return timeEntrySchema.safeParse({
    date: formData.get("date"),
    hours: formData.get("hours"),
    minutes: formData.get("minutes"),
    description: formData.get("description"),
    billable: formData.get("billable"),
    hourlyRate: formData.get("hourlyRate"),
    ticketId: formData.get("ticketId"),
    taskId: formData.get("taskId"),
    visitId: formData.get("visitId"),
    clientId: formData.get("clientId"),
  });
}

export async function createTimeEntryAction(
  _prev: TimeEntryFormState,
  formData: FormData,
): Promise<TimeEntryFormState> {
  const user = await requireTimesheeting();
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = normalizeTimeEntryInput(parsed.data);
  const clientId = await resolveClientId(data);
  const hourlyRateCents = await resolveRate(data.hourlyRateCents, clientId);
  await prisma.timeEntry.create({
    data: { ...data, hourlyRateCents, clientId, userId: user.id, status: "DRAFT" },
  });
  revalidatePath("/timesheets");
  redirect(safeRedirect(formData));
}

export async function updateTimeEntryAction(
  _prev: TimeEntryFormState,
  formData: FormData,
): Promise<TimeEntryFormState> {
  const user = await requireTimesheeting();
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return { error: "Missing entry id." };
  }
  const existing = await prisma.timeEntry.findUnique({ where: { id }, select: { userId: true, status: true } });
  if (!existing || existing.userId !== user.id) {
    return { error: "You can only edit your own entries." };
  }
  if (existing.status !== "DRAFT" && existing.status !== "REJECTED") {
    return { error: "Only draft or rejected entries can be edited." };
  }
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = normalizeTimeEntryInput(parsed.data);
  const clientId = await resolveClientId(data);
  const hourlyRateCents = await resolveRate(data.hourlyRateCents, clientId);
  await prisma.timeEntry.update({ where: { id }, data: { ...data, hourlyRateCents, clientId } });
  revalidatePath("/timesheets");
  redirect(safeRedirect(formData));
}

export async function deleteTimeEntryAction(formData: FormData): Promise<void> {
  const user = await requireTimesheeting();
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    const existing = await prisma.timeEntry.findUnique({ where: { id }, select: { userId: true, status: true } });
    if (existing && existing.userId === user.id && existing.status !== "APPROVED") {
      await prisma.timeEntry.delete({ where: { id } });
      revalidatePath("/timesheets");
    }
  }
  redirect(safeRedirect(formData));
}

export async function submitTimeEntryAction(formData: FormData): Promise<void> {
  const user = await requireTimesheeting();
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    const existing = await prisma.timeEntry.findUnique({ where: { id }, select: { userId: true, status: true } });
    if (existing && existing.userId === user.id && (existing.status === "DRAFT" || existing.status === "REJECTED")) {
      await prisma.timeEntry.update({
        where: { id },
        data: { status: "SUBMITTED", approvedById: null, approvedAt: null },
      });
      revalidatePath("/timesheets");
    }
  }
  redirect(safeRedirect(formData));
}

export async function approveTimeEntryAction(formData: FormData): Promise<void> {
  const user = await requireTimesheeting("timesheets.approve");
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    const existing = await prisma.timeEntry.findUnique({ where: { id }, select: { status: true } });
    if (existing && existing.status === "SUBMITTED") {
      await prisma.timeEntry.update({
        where: { id },
        data: { status: "APPROVED", approvedById: user.id, approvedAt: new Date() },
      });
      revalidatePath("/timesheets/approvals");
      revalidatePath("/timesheets");
    }
  }
  redirect(safeRedirect(formData) === "/timesheets" ? "/timesheets/approvals" : safeRedirect(formData));
}

export async function rejectTimeEntryAction(formData: FormData): Promise<void> {
  const user = await requireTimesheeting("timesheets.approve");
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    const existing = await prisma.timeEntry.findUnique({ where: { id }, select: { status: true } });
    if (existing && existing.status === "SUBMITTED") {
      await prisma.timeEntry.update({
        where: { id },
        data: { status: "REJECTED", approvedById: user.id, approvedAt: new Date() },
      });
      revalidatePath("/timesheets/approvals");
      revalidatePath("/timesheets");
    }
  }
  redirect(safeRedirect(formData) === "/timesheets" ? "/timesheets/approvals" : safeRedirect(formData));
}

// ---------------------------------------------------------------------------
// Timer
// ---------------------------------------------------------------------------

function readLinks(formData: FormData) {
  const get = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" && v.length > 0 ? v : null;
  };
  return { ticketId: get("ticketId"), taskId: get("taskId"), visitId: get("visitId"), clientId: get("clientId") };
}

export async function startTimerAction(formData: FormData): Promise<void> {
  const user = await requireTimesheeting();
  const existing = await prisma.timeTimer.findUnique({ where: { userId: user.id } });
  if (!existing) {
    const links = readLinks(formData);
    const clientId = await resolveClientId(links);
    const descriptionRaw = formData.get("description");
    await prisma.timeTimer.create({
      data: {
        userId: user.id,
        description: typeof descriptionRaw === "string" && descriptionRaw.length > 0 ? descriptionRaw : null,
        ...links,
        clientId,
      },
    });
    revalidatePath("/", "layout");
  }
  redirect(safeRedirect(formData));
}

export async function stopTimerAction(formData: FormData): Promise<void> {
  const user = await requireTimesheeting();
  const timer = await prisma.timeTimer.findUnique({ where: { userId: user.id } });
  if (timer) {
    const elapsedMs = Date.now() - new Date(timer.startedAt).getTime();
    const minutes = Math.max(1, Math.round(elapsedMs / 60000));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hourlyRateCents = await resolveRate(null, timer.clientId);
    await prisma.$transaction([
      prisma.timeEntry.create({
        data: {
          userId: user.id,
          date: today,
          minutes,
          description: timer.description,
          billable: true,
          hourlyRateCents,
          ticketId: timer.ticketId,
          taskId: timer.taskId,
          visitId: timer.visitId,
          clientId: timer.clientId,
          status: "DRAFT",
        },
      }),
      prisma.timeTimer.delete({ where: { userId: user.id } }),
    ]);
    revalidatePath("/", "layout");
    revalidatePath("/timesheets");
  }
  redirect(safeRedirect(formData));
}

export async function cancelTimerAction(formData: FormData): Promise<void> {
  const user = await requireTimesheeting();
  await prisma.timeTimer.deleteMany({ where: { userId: user.id } });
  revalidatePath("/", "layout");
  redirect(safeRedirect(formData));
}
