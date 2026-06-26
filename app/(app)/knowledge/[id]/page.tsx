import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { getArticle } from "@/lib/knowledge/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Markdown } from "@/components/knowledge/markdown";
import { deleteArticleAction } from "../actions";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("knowledge.read");
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) notFound();

  const canManage = can(user, "knowledge.manage");
  // Drafts are only visible to managers.
  if (article.status === "DRAFT" && !canManage) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Knowledge", href: "/knowledge" }, { label: article.title }]} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{article.title}</h1>
            {article.category ? (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${article.category.color}22`, color: article.category.color }}>
                {article.category.name}
              </span>
            ) : null}
            {article.status === "DRAFT" ? (
              <span className="inline-flex items-center rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">Draft</span>
            ) : null}
            {article.visibleToPortal ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#10b98122] px-2 py-0.5 text-xs font-medium text-[#10b981]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" /> Portal
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {article.author ? `${article.author.firstName} ${article.author.lastName} · ` : ""}
            Updated {new Date(article.updatedAt).toLocaleDateString()}
          </p>
        </div>
        {canManage ? (
          <div className="flex items-center gap-2">
            <Link href={`/knowledge/${article.id}/edit`}><Button variant="outline" size="sm">Edit</Button></Link>
            <form action={deleteArticleAction}>
              <input type="hidden" name="id" value={article.id} />
              <Button type="submit" variant="destructive" size="sm">Delete</Button>
            </form>
          </div>
        ) : null}
      </div>

      <Card>
        <CardContent className="py-6">
          <Markdown>{article.body}</Markdown>
        </CardContent>
      </Card>
    </div>
  );
}
