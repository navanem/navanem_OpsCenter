import Link from "next/link";
import { requireUser } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import type { PermissionKey } from "@/lib/rbac/permissions";

export default async function SettingsPage() {
  const [user, dict] = await Promise.all([requireUser(), getDictionary()]);
  const t = dict.settings;

  const sections: { title: string; description: string; href: string; permission: PermissionKey }[] = [
    { title: t.general, description: t.generalDesc, href: "/settings/general", permission: "settings.manage" },
    { title: t.email, description: t.emailDesc, href: "/settings/email", permission: "settings.manage" },
    { title: t.language, description: t.languageDesc, href: "/settings/language", permission: "settings.manage" },
    { title: t.taxonomies, description: t.taxonomiesDesc, href: "/settings/taxonomies", permission: "settings.manage" },
    { title: t.timesheets, description: t.timesheetsDesc, href: "/settings/timesheets", permission: "settings.manage" },
    { title: t.contracts, description: t.contractsDesc, href: "/settings/contracts", permission: "settings.manage" },
    { title: t.devices, description: t.devicesDesc, href: "/settings/devices", permission: "settings.manage" },
    { title: t.subscriptions, description: t.subscriptionsDesc, href: "/settings/subscriptions", permission: "settings.manage" },
    { title: t.changes, description: t.changesDesc, href: "/settings/changes", permission: "settings.manage" },
    { title: t.users, description: t.usersDesc, href: "/settings/users", permission: "users.read" },
    { title: t.roles, description: t.rolesDesc, href: "/settings/roles", permission: "roles.read" },
    { title: t.audit, description: t.auditDesc, href: "/settings/audit", permission: "audit.read" },
  ];

  const visible = sections.filter((s) => can(user, s.permission));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t.title }]} />
      <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>

      {visible.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">{dict.common.noResults}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((s) => (
            <Link key={s.href} href={s.href} className="group">
              <Card className="h-full p-6 transition-shadow hover:shadow-md">
                <h2 className="text-lg font-medium group-hover:underline">{s.title}</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{s.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
