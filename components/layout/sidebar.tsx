import Link from "next/link";
import { can } from "@/lib/rbac/can";
import type { PermissionKey } from "@/lib/rbac/permissions";

const items: { href: string; label: string; permission?: PermissionKey }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clients", label: "Clients", permission: "clients.read" },
  { href: "/settings", label: "Settings", permission: "settings.manage" },
];

export function Sidebar({ permissions }: { permissions: string[] }) {
  const user = { id: "", email: "", permissions };
  const visible = items.filter((i) => !i.permission || can(user, i.permission));
  return (
    <aside className="w-60 shrink-0 border-r border-[var(--border)] bg-[var(--card)] p-4">
      <div className="mb-6 px-2 text-lg font-semibold tracking-tight">OpsCenter</div>
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
