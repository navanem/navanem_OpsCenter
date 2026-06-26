import { z } from "zod";

const optional = z.string().trim().optional().or(z.literal(""));

export const articleSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  body: z.string().trim().min(1, "Content is required"),
  excerpt: optional,
  categoryId: optional,
  status: z.enum(["DRAFT", "PUBLISHED"]).optional().default("DRAFT"),
  visibleToPortal: z.boolean().optional().default(false),
});
export type ArticleInput = z.infer<typeof articleSchema>;

function orNull(v?: string): string | null {
  return v && v.length > 0 ? v : null;
}

export function normalizeArticleInput(input: ArticleInput) {
  return {
    title: input.title,
    body: input.body,
    excerpt: orNull(input.excerpt),
    categoryId: orNull(input.categoryId),
    status: input.status,
    // Only published articles can be portal-visible.
    visibleToPortal: input.status === "PUBLISHED" ? input.visibleToPortal : false,
  };
}
