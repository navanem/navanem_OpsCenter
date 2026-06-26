import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { getArticle } from "@/lib/knowledge/queries";
import { listKnowledgeCategories } from "@/lib/taxonomies/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { KnowledgeForm } from "../../knowledge-form";
import { updateArticleAction } from "../../actions";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("knowledge.manage");
  const { id } = await params;
  const [article, categories] = await Promise.all([
    getArticle(id),
    listKnowledgeCategories({ activeOnly: true }),
  ]);
  if (!article) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Knowledge", href: "/knowledge" }, { label: article.title, href: `/knowledge/${article.id}` }, { label: "Edit" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">Edit article</h1>
      <Card>
        <CardHeader>
          <CardTitle>{article.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <KnowledgeForm
            action={updateArticleAction}
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            defaults={{
              id: article.id,
              title: article.title,
              body: article.body,
              excerpt: article.excerpt,
              categoryId: article.categoryId,
              status: article.status,
            }}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
