import Link from "next/link";

const items = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/clients", label: "Clients" },
  { href: "/settings", label: "Paramètres" },
];

export function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-[var(--border)] bg-[var(--card)] p-4">
      <div className="mb-6 px-2 text-lg font-semibold tracking-tight">
        OpsCenter
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[var(--radius)] px-3 py-2 text-sm text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
