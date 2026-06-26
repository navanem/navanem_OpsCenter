import { prisma } from "@/lib/db";

const include = {
  category: { select: { id: true, name: true, color: true } },
  author: { select: { id: true, firstName: true, lastName: true } },
};

export interface ArticleFilters {
  search?: string;
  categoryId?: string;
  status?: "DRAFT" | "PUBLISHED";
}

export function listArticles(filters: ArticleFilters = {}) {
  return prisma.knowledgeArticle.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: "insensitive" as const } },
              { body: { contains: filters.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    include,
    orderBy: { updatedAt: "desc" },
  });
}

export function getArticle(id: string) {
  return prisma.knowledgeArticle.findUnique({ where: { id }, include });
}

export async function getKnowledgeStats() {
  const [total, published] = await Promise.all([
    prisma.knowledgeArticle.count(),
    prisma.knowledgeArticle.count({ where: { status: "PUBLISHED" } }),
  ]);
  return { total, published, drafts: total - published };
}
