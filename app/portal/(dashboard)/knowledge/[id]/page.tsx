import Link from "next/link";
import { notFound } from "next/navigation";
import { requireContact } from "@/lib/portal/current-contact";
import { getPortalArticle } from "@/lib/portal/queries";
import { getDictionary } from "@/lib/i18n/server";
import { Card, CardContent } from "@/components/ui/card";
import { Markdown } from "@/components/knowledge/markdown";

export default async function PortalArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const [, dict] = await Promise.all([requireContact(), getDictionary()]);
  const t = dict.portal;
  const { id } = await params;
  const article = await getPortalArticle(id);
  if (!article) notFound();

  return (
    <>
      <div>
        <Link href="/portal/knowledge" className="text-sm text-[var(--muted-foreground)] hover:underline">
          ← {t.backToKb}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{article.title}</h1>
          {article.category ? (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${article.category.color}22`, color: article.category.color }}>
              {article.category.name}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">{t.updated} {new Date(article.updatedAt).toLocaleDateString()}</p>
      </div>

      <Card>
        <CardContent className="py-6">
          <Markdown>{article.body}</Markdown>
        </CardContent>
      </Card>
    </>
  );
}
