"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import {
  visitSchema,
  normalizeVisitInput,
  recurringVisitSchema,
  normalizeRecurringInput,
} from "@/lib/validation/planning";
import { generateOccurrences } from "@/lib/planning/recurrence";

// ---------------------------------------------------------------------------
// Visit actions
// ---------------------------------------------------------------------------

export interface VisitFormState {
  error?: string;
}

function readVisitForm(formData: FormData) {
  return visitSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    typeId: formData.get("typeId"),
    clientId: formData.get("clientId"),
    assigneeId: formData.get("assigneeId"),
    location: formData.get("location"),
    scheduledAt: formData.get("scheduledAt"),
    durationMinutes: formData.get("durationMinutes"),
    status: formData.get("status"),
    notes: formData.get("notes"),
  });
}

export async function createVisitAction(
  _prev: VisitFormState,
  formData: FormData,
): Promise<VisitFormState> {
  await requirePermission("visits.manage");
  const parsed = readVisitForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const type = await prisma.visitType.findUnique({ where: { id: parsed.data.typeId } });
  if (!type) {
    return { error: "Selected visit type no longer exists." };
  }
  await prisma.visit.create({ data: normalizeVisitInput(parsed.data) });
  revalidatePath("/planning");
  redirect("/planning");
}

export async function updateVisitAction(
  _prev: VisitFormState,
  formData: FormData,
): Promise<VisitFormState> {
  await requirePermission("visits.manage");
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return { error: "Missing visit id." };
  }
  const parsed = readVisitForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const type = await prisma.visitType.findUnique({ where: { id: parsed.data.typeId } });
  if (!type) {
    return { error: "Selected visit type no longer exists." };
  }
  await prisma.visit.update({ where: { id }, data: normalizeVisitInput(parsed.data) });
  revalidatePath("/planning");
  redirect("/planning");
}

export async function deleteVisitAction(formData: FormData): Promise<void> {
  await requirePermission("visits.manage");
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    await prisma.visit.delete({ where: { id } });
    revalidatePath("/planning");
  }
  redirect("/planning");
}

export async function setVisitStatusAction(formData: FormData): Promise<void> {
  await requirePermission("visits.manage");
  const id = formData.get("id");
  const status = formData.get("status");
  if (
    typeof id === "string" &&
    id.length > 0 &&
    (status === "SCHEDULED" || status === "COMPLETED" || status === "CANCELLED")
  ) {
    await prisma.visit.update({ where: { id }, data: { status } });
    revalidatePath("/planning");
  }
  redirect("/planning");
}

export async function assignVisitAction(formData: FormData): Promise<void> {
  await requirePermission("visits.assign");
  const id = formData.get("id");
  const assigneeRaw = formData.get("assigneeId");
  const assigneeId =
    typeof assigneeRaw === "string" && assigneeRaw.length > 0 ? assigneeRaw : null;
  if (typeof id === "string" && id.length > 0) {
    await prisma.visit.update({ where: { id }, data: { assigneeId } });
    revalidatePath("/planning");
  }
  redirect("/planning");
}

// ---------------------------------------------------------------------------
// Recurring-visit actions (regenerate the series' future occurrences)
// ---------------------------------------------------------------------------

const HORIZON_DAYS = 90;

async function regenerate(recurringId: string) {
  const rv = await prisma.recurringVisit.findUnique({ where: { id: recurringId } });
  if (!rv) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Remove future, still-scheduled occurrences; keep completed/cancelled history and past visits.
  await prisma.visit.deleteMany({
    where: { recurringVisitId: recurringId, status: "SCHEDULED", scheduledAt: { gte: today } },
  });
  if (!rv.isActive) return;
  const horizonEnd = new Date(today);
  horizonEnd.setDate(horizonEnd.getDate() + HORIZON_DAYS);
  const occ = generateOccurrences(
    {
      frequency: rv.frequency,
      interval: rv.interval,
      startDate: rv.startDate,
      endDate: rv.endDate,
      weekdays: rv.weekdays,
      timeHour: rv.timeHour,
      timeMinute: rv.timeMinute,
    },
    horizonEnd,
  ).filter((d) => d >= today);
  if (occ.length === 0) return;
  await prisma.visit.createMany({
    data: occ.map((scheduledAt) => ({
      title: rv.title,
      description: rv.description,
      typeId: rv.typeId,
      clientId: rv.clientId,
      assigneeId: rv.assigneeId,
      location: rv.location,
      scheduledAt,
      durationMinutes: rv.durationMinutes,
      status: "SCHEDULED" as const,
      recurringVisitId: rv.id,
    })),
  });
}

export interface RecurringFormState {
  error?: string;
}

function readRecurringForm(formData: FormData) {
  return recurringVisitSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    typeId: formData.get("typeId"),
    clientId: formData.get("clientId"),
    assigneeId: formData.get("assigneeId"),
    location: formData.get("location"),
    durationMinutes: formData.get("durationMinutes"),
    frequency: formData.get("frequency"),
    interval: formData.get("interval"),
    weekdays: formData.getAll("weekdays"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    timeHour: formData.get("timeHour"),
    timeMinute: formData.get("timeMinute"),
  });
}

export async function createRecurringVisitAction(
  _prev: RecurringFormState,
  formData: FormData,
): Promise<RecurringFormState> {
  await requirePermission("visits.manage");
  const parsed = readRecurringForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const type = await prisma.visitType.findUnique({ where: { id: parsed.data.typeId } });
  if (!type) {
    return { error: "Selected visit type no longer exists." };
  }
  const created = await prisma.recurringVisit.create({
    data: normalizeRecurringInput(parsed.data),
  });
  await regenerate(created.id);
  revalidatePath("/planning");
  redirect("/planning/recurring");
}

export async function updateRecurringVisitAction(
  _prev: RecurringFormState,
  formData: FormData,
): Promise<RecurringFormState> {
  await requirePermission("visits.manage");
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return { error: "Missing recurring visit id." };
  }
  const parsed = readRecurringForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const type = await prisma.visitType.findUnique({ where: { id: parsed.data.typeId } });
  if (!type) {
    return { error: "Selected visit type no longer exists." };
  }
  await prisma.recurringVisit.update({
    where: { id },
    data: normalizeRecurringInput(parsed.data),
  });
  await regenerate(id);
  revalidatePath("/planning");
  redirect("/planning/recurring");
}

export async function deleteRecurringVisitAction(formData: FormData): Promise<void> {
  await requirePermission("visits.manage");
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.visit.deleteMany({
      where: { recurringVisitId: id, status: "SCHEDULED", scheduledAt: { gte: today } },
    });
    // Remaining past/completed occurrences keep their history (FK onDelete: SetNull).
    await prisma.recurringVisit.delete({ where: { id } });
    revalidatePath("/planning");
  }
  redirect("/planning/recurring");
}
