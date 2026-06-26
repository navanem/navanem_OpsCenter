import Link from "next/link";
import { requireContact } from "@/lib/portal/current-contact";
import { listPortalArticles } from "@/lib/portal/queries";
import { getDictionary } from "@/lib/i18n/server";
import { Card } from "@/components/ui/card";

export default async function PortalKnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const [, dict] = await Promise.all([requireContact(), getDictionary()]);
  const t = dict.portal;
  const sp = await searchParams;
  const search = sp.search?.trim() || undefined;
  const articles = await listPortalArticles(search);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{t.knowledgeBase}</h1>
      </div>

      <form className="flex gap-2">
        <input
          type="search"
          name="search"
          defaultValue={search ?? ""}
          placeholder={t.searchArticles}
          className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        />
        <button type="submit" className="rounded-[var(--radius)] border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--muted)]">
          {dict.common.search}
        </button>
      </form>

      {articles.length === 0 ? (
        <Card>
          <p className="p-6 text-[var(--muted-foreground)]">
            {search ? t.noArticlesMatch : t.noArticles}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <Link key={a.id} href={`/portal/knowledge/${a.id}`} className="block">
              <Card className="p-4 transition-colors hover:border-[var(--ring)]">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-medium">{a.title}</h2>
                  {a.category ? (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${a.category.color}22`, color: a.category.color }}>
                      {a.category.name}
                    </span>
                  ) : null}
                </div>
                {a.excerpt ? <p className="mt-1 text-sm text-[var(--muted-foreground)]">{a.excerpt}</p> : null}
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{t.updated} {new Date(a.updatedAt).toLocaleDateString()}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
