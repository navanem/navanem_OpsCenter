"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { isCrmEnabled } from "@/lib/settings/service";
import { opportunitySchema, normalizeOpportunityInput } from "@/lib/validation/crm";
import { recordAudit } from "@/lib/audit/log";
import { recordOpportunityActivity } from "@/lib/crm/activity";
import { formatOpportunityReference } from "@/lib/crm/meta";
import { sendMail, isSmtpConfigured } from "@/lib/mailer";

export interface OpportunityFormState {
  error?: string;
}

async function requireCrm() {
  const user = await requirePermission("crm.manage");
  if (!(await isCrmEnabled())) redirect("/dashboard");
  return user;
}

function parseForm(formData: FormData) {
  return opportunitySchema.safeParse({
    name: formData.get("name"),
    clientId: formData.get("clientId"),
    stageId: formData.get("stageId"),
    ownerId: formData.get("ownerId"),
    value: formData.get("value"),
    probability: formData.get("probability"),
    outcome: formData.get("outcome"),
    expectedCloseAt: formData.get("expectedCloseAt"),
    notes: formData.get("notes"),
  });
}

export async function createOpportunityAction(_prev: OpportunityFormState, formData: FormData): Promise<OpportunityFormState> {
  await requireCrm();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const opp = await prisma.opportunity.create({ data: normalizeOpportunityInput(parsed.data) });
  await recordAudit({ action: "created", entityType: "opportunity", entityId: opp.id, entityLabel: formatOpportunityReference(opp.number), summary: `Created opportunity "${opp.name}"` });
  await recordOpportunityActivity(opp.id, "CREATED");
  revalidatePath("/crm");
  redirect(`/crm/${opp.id}/edit`);
}

export async function updateOpportunityAction(_prev: OpportunityFormState, formData: FormData): Promise<OpportunityFormState> {
  await requireCrm();
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return { error: "Missing opportunity id." };
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await prisma.opportunity.update({ where: { id }, data: normalizeOpportunityInput(parsed.data) });
  await recordAudit({ action: "updated", entityType: "opportunity", entityId: id, entityLabel: parsed.data.name, summary: `Updated opportunity "${parsed.data.name}"` });
  await recordOpportunityActivity(id, "UPDATED");
  revalidatePath("/crm");
  redirect("/crm");
}

// Move an opportunity to another pipeline stage (drag-and-drop on the board).
// stageId === "" clears the stage (moves it to the Unassigned column).
export async function moveOpportunityAction(id: string, stageId: string): Promise<void> {
  await requireCrm();
  if (!id) return;
  const opp = await prisma.opportunity.findUnique({ where: { id }, select: { number: true, stageId: true } });
  if (!opp) return;
  const nextStageId = stageId.length > 0 ? stageId : null;
  if (opp.stageId === nextStageId) return;
  const target = nextStageId ? await prisma.opportunityStage.findUnique({ where: { id: nextStageId }, select: { name: true } }) : null;
  await prisma.opportunity.update({ where: { id }, data: { stageId: nextStageId } });
  await recordAudit({ action: "stage_changed", entityType: "opportunity", entityId: id, entityLabel: formatOpportunityReference(opp.number), summary: `Moved opportunity ${formatOpportunityReference(opp.number)} to a new stage` });
  await recordOpportunityActivity(id, "STAGE_CHANGED", target?.name ?? "—");
  revalidatePath("/crm");
}

// Mark an opportunity won/lost (or reopen) inline from the pipeline board.
export async function markOutcomeAction(id: string, outcome: string): Promise<void> {
  await requireCrm();
  if (!id || (outcome !== "OPEN" && outcome !== "WON" && outcome !== "LOST")) return;
  const opp = await prisma.opportunity.findUnique({ where: { id }, select: { number: true, outcome: true } });
  if (!opp || opp.outcome === outcome) return;
  await prisma.opportunity.update({
    where: { id },
    data: { outcome: outcome as "OPEN" | "WON" | "LOST", closedAt: outcome === "OPEN" ? null : new Date() },
  });
  await recordAudit({ action: "outcome_changed", entityType: "opportunity", entityId: id, entityLabel: formatOpportunityReference(opp.number), summary: `Marked opportunity ${formatOpportunityReference(opp.number)} as ${outcome.toLowerCase()}` });
  await recordOpportunityActivity(id, "OUTCOME_CHANGED", outcome);
  revalidatePath("/crm");
}

export interface EmailState {
  error?: string;
  ok?: boolean;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Email the opportunity's client contact and log it on the timeline.
export async function sendOpportunityEmailAction(_prev: EmailState, formData: FormData): Promise<EmailState> {
  await requireCrm();
  const id = formData.get("id");
  const subject = formData.get("subject");
  const body = formData.get("body");
  if (typeof id !== "string" || id.length === 0) return { error: "Missing opportunity id." };
  if (typeof subject !== "string" || subject.trim().length === 0) return { error: "Subject is required." };
  if (typeof body !== "string" || body.trim().length === 0) return { error: "Message is required." };
  if (!(await isSmtpConfigured())) return { error: "SMTP is not configured. Set it up in Settings → Email." };
  const opp = await prisma.opportunity.findUnique({ where: { id }, select: { number: true, client: { select: { contactEmail: true } } } });
  const to = opp?.client?.contactEmail;
  if (!to) return { error: "This opportunity's client has no contact email." };
  try {
    await sendMail({ to, subject: subject.trim(), html: `<p>${escapeHtml(body.trim()).replace(/\n/g, "<br>")}</p>`, text: body.trim() });
  } catch {
    return { error: "Failed to send the email. Check the SMTP settings." };
  }
  await recordOpportunityActivity(id, "EMAIL", subject.trim());
  await recordAudit({ action: "emailed", entityType: "opportunity", entityId: id, entityLabel: opp ? formatOpportunityReference(opp.number) : undefined, summary: `Emailed ${to} re: "${subject.trim()}"` });
  revalidatePath(`/crm/${id}/edit`);
  return { ok: true };
}

// Add a free-text note to an opportunity's timeline.
export async function addOpportunityNoteAction(formData: FormData): Promise<void> {
  await requireCrm();
  const id = formData.get("id");
  const body = formData.get("body");
  if (typeof id === "string" && id.length > 0 && typeof body === "string" && body.trim().length > 0) {
    await recordOpportunityActivity(id, "NOTE", body.trim());
    revalidatePath(`/crm/${id}/edit`);
  }
  redirect(`/crm/${typeof id === "string" ? id : ""}/edit`);
}

export async function deleteOpportunityAction(formData: FormData): Promise<void> {
  await requireCrm();
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    const existing = await prisma.opportunity.findUnique({ where: { id }, select: { number: true } });
    await prisma.opportunity.delete({ where: { id } });
    await recordAudit({ action: "deleted", entityType: "opportunity", entityId: id, entityLabel: existing ? formatOpportunityReference(existing.number) : undefined, summary: `Deleted opportunity ${existing ? formatOpportunityReference(existing.number) : id}` });
    revalidatePath("/crm");
  }
  redirect("/crm");
}
