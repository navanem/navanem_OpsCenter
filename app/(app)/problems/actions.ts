"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { isProblemsEnabled } from "@/lib/settings/service";
import { problemSchema, normalizeProblemInput } from "@/lib/validation/problem";
import { recordAudit } from "@/lib/audit/log";
import { formatProblemReference } from "@/lib/problems/meta";

export interface ProblemFormState {
  error?: string;
}

async function requireProblems() {
  const user = await requirePermission("problems.manage");
  if (!(await isProblemsEnabled())) redirect("/dashboard");
  return user;
}

function parseForm(formData: FormData) {
  return problemSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    typeId: formData.get("typeId"),
    statusId: formData.get("statusId"),
    clientId: formData.get("clientId"),
    assigneeId: formData.get("assigneeId"),
    priority: formData.get("priority"),
    impact: formData.get("impact"),
    rootCause: formData.get("rootCause"),
    workaround: formData.get("workaround"),
    resolution: formData.get("resolution"),
    knownError: formData.get("knownError"),
  });
}

export async function createProblemAction(_prev: ProblemFormState, formData: FormData): Promise<ProblemFormState> {
  await requireProblems();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const problem = await prisma.problem.create({ data: normalizeProblemInput(parsed.data) });
  await recordAudit({ action: "created", entityType: "problem", entityId: problem.id, entityLabel: formatProblemReference(problem.number), summary: `Created problem "${problem.title}"` });
  revalidatePath("/problems");
  redirect(`/problems/${problem.id}/edit`);
}

export async function updateProblemAction(_prev: ProblemFormState, formData: FormData): Promise<ProblemFormState> {
  await requireProblems();
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return { error: "Missing problem id." };
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await prisma.problem.update({ where: { id }, data: normalizeProblemInput(parsed.data) });
  await recordAudit({ action: "updated", entityType: "problem", entityId: id, entityLabel: parsed.data.title, summary: `Updated problem "${parsed.data.title}"` });
  revalidatePath("/problems");
  redirect("/problems");
}

export async function deleteProblemAction(formData: FormData): Promise<void> {
  await requireProblems();
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    const existing = await prisma.problem.findUnique({ where: { id }, select: { number: true } });
    await prisma.problem.delete({ where: { id } });
    await recordAudit({ action: "deleted", entityType: "problem", entityId: id, entityLabel: existing ? formatProblemReference(existing.number) : undefined, summary: `Deleted problem ${existing ? formatProblemReference(existing.number) : id}` });
    revalidatePath("/problems");
  }
  redirect("/problems");
}
