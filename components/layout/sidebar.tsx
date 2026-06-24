import Link from "next/link";
import { can } from "@/lib/rbac/can";
import type { PermissionKey } from "@/lib/rbac/permissions";

const items: { href: string; label: string; permission?: PermissionKey }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clients", label: "Clients", permission: "clients.read" },
  { href: "/settings", label: "Settings", permission: "settings.manage" },
];

interface SidebarProps {
  permissions: string[];
  brandName: string;
  hasLogo: boolean;
}

export function Sidebar({ permissions, brandName, hasLogo }: SidebarProps) {
  const user = { id: "", email: "", permissions };
  const visible = items.filter((i) => !i.permission || can(user, i.permission));
  return (
    <aside className="w-60 shrink-0 border-r border-[var(--border)] bg-[var(--card)] p-4">
      <div className="mb-6 px-2">
        {hasLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/api/logo" alt={brandName} className="h-7 w-auto" />
        ) : (
          <span className="text-lg font-semibold tracking-tight">{brandName}</span>
        )}
      </div>
      <nav className="flex flex-col gap-1">
        {visible.map((item) => (
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
