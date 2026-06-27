"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth/guard";
import { articleSchema, normalizeArticleInput } from "@/lib/validation/knowledge";
import { recordAudit } from "@/lib/audit/log";

export interface ArticleFormState {
  error?: string;
}

function parseForm(formData: FormData) {
  return articleSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    excerpt: formData.get("excerpt"),
    categoryId: formData.get("categoryId"),
    status: formData.get("status"),
    visibleToPortal: formData.get("visibleToPortal") === "on",
  });
}

export async function createArticleAction(
  _prev: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  const user = await requirePermission("knowledge.manage");
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const article = await prisma.knowledgeArticle.create({
    data: { ...normalizeArticleInput(parsed.data), authorId: user.id },
  });
  await recordAudit({ action: "created", entityType: "article", entityId: article.id, entityLabel: article.title, summary: `Created article "${article.title}"` });
  revalidatePath("/knowledge");
  redirect(`/knowledge/${article.id}`);
}

export async function updateArticleAction(
  _prev: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  await requirePermission("knowledge.manage");
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return { error: "Missing article id." };
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await prisma.knowledgeArticle.update({ where: { id }, data: normalizeArticleInput(parsed.data) });
  await recordAudit({ action: "updated", entityType: "article", entityId: id, entityLabel: parsed.data.title, summary: `Updated article "${parsed.data.title}"` });
  revalidatePath("/knowledge");
  redirect(`/knowledge/${id}`);
}

export async function deleteArticleAction(formData: FormData): Promise<void> {
  await requirePermission("knowledge.manage");
  const id = formData.get("id");
  if (typeof id === "string" && id.length > 0) {
    const existing = await prisma.knowledgeArticle.findUnique({ where: { id }, select: { title: true } });
    await prisma.knowledgeArticle.delete({ where: { id } });
    await recordAudit({ action: "deleted", entityType: "article", entityId: id, entityLabel: existing?.title, summary: `Deleted article "${existing?.title ?? id}"` });
    revalidatePath("/knowledge");
  }
  redirect("/knowledge");
}
