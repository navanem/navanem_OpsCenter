import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted-foreground)]">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link href={item.href} className="transition hover:text-[var(--foreground)]">
                  {item.label}
                </Link>
              ) : (
                <span className={last ? "font-medium text-[var(--foreground)]" : undefined}>
                  {item.label}
                </span>
              )}
              {!last ? <span aria-hidden className="text-[var(--border)]">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
