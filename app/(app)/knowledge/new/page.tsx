import { requirePermission } from "@/lib/auth/guard";
import { listKnowledgeCategories } from "@/lib/taxonomies/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { KnowledgeForm } from "../knowledge-form";
import { createArticleAction } from "../actions";

export default async function NewArticlePage() {
  await requirePermission("knowledge.manage");
  const categories = await listKnowledgeCategories({ activeOnly: true });

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Knowledge", href: "/knowledge" }, { label: "New article" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">New article</h1>
      <Card>
        <CardHeader>
          <CardTitle>New article</CardTitle>
        </CardHeader>
        <CardContent>
          <KnowledgeForm
            action={createArticleAction}
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            submitLabel="Create article"
          />
        </CardContent>
      </Card>
    </div>
  );
}
