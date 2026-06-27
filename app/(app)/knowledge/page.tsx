import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { listArticles, getKnowledgeStats } from "@/lib/knowledge/queries";
import { listKnowledgeCategories } from "@/lib/taxonomies/queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { KnowledgeFilters } from "./knowledge-filters";

type SP = { search?: string; categoryId?: string; status?: string };

export default async function KnowledgePage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requirePermission("knowledge.read");
  const [sp, dict] = await Promise.all([searchParams, getDictionary()]);
  const canManage = can(user, "knowledge.manage");

  // Non-managers only ever see published articles.
  const statusFilter = canManage
    ? sp.status === "DRAFT" || sp.status === "PUBLISHED"
      ? (sp.status as "DRAFT" | "PUBLISHED")
      : undefined
    : ("PUBLISHED" as const);

  const [articles, categories, stats] = await Promise.all([
    listArticles({ search: sp.search, categoryId: sp.categoryId, status: statusFilter }),
    listKnowledgeCategories({ activeOnly: true }),
    getKnowledgeStats(),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.nav.knowledge }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{dict.nav.knowledge}</h1>
        {canManage ? <Link href="/knowledge/new"><Button>{dict.knowledge.new}</Button></Link> : null}
      </div>

      {canManage ? (
        <StatGrid>
          <StatCard label={dict.knowledge.kpiArticles} value={stats.total} color="#6d5efc" />
          <StatCard label={dict.knowledge.kpiPublished} value={stats.published} color="#10b981" />
          <StatCard label={dict.knowledge.kpiDrafts} value={stats.drafts} color="#f59e0b" />
          <StatCard label={dict.knowledge.kpiCategories} value={categories.length} color="#3b82f6" />
        </StatGrid>
      ) : null}

      <KnowledgeFilters categories={categories.map((c) => ({ id: c.id, name: c.name }))} canManage={canManage} />

      {articles.length === 0 ? (
        <Card>
          <p className="p-6 text-[var(--muted-foreground)]">{dict.knowledge.noneFound}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <Card key={a.id} className="p-4 transition-colors hover:border-[var(--ring)]/40">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/knowledge/${a.id}`} className="text-base font-medium hover:underline">
                    {a.title}
                  </Link>
                  {a.excerpt ? <p className="mt-1 text-sm text-[var(--muted-foreground)]">{a.excerpt}</p> : null}
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    {a.author ? `${a.author.firstName} ${a.author.lastName} · ` : ""}
                    {dict.common.updated} {new Date(a.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {a.category ? (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${a.category.color}22`, color: a.category.color }}>
                      {a.category.name}
                    </span>
                  ) : null}
                  {a.status === "DRAFT" ? (
                    <span className="inline-flex items-center rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">{dict.knowledge.draft}</span>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
