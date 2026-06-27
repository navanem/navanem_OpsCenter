import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { listRoles } from "@/lib/roles/queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";

export default async function RolesPage() {
  const user = await requirePermission("roles.read");
  const [roles, dict] = await Promise.all([listRoles(), getDictionary()]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.settings.title, href: "/settings" }, { label: dict.settings.roles }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{dict.settings.roles}</h1>
        {can(user, "roles.manage") ? (
          <Link href="/settings/roles/new">
            <Button>{dict.roles.new}</Button>
          </Link>
        ) : null}
      </div>

      <Card>
        {roles.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">{dict.roles.noneFound}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-6 py-3 font-medium">{dict.common.name}</th>
                <th scope="col" className="px-6 py-3 font-medium">{dict.common.description}</th>
                <th scope="col" className="px-6 py-3 font-medium">{dict.roles.colPermissions}</th>
                <th scope="col" className="px-6 py-3 font-medium">{dict.roles.colUsers}</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-6 py-3">
                    <span className="flex items-center gap-2">
                      {can(user, "roles.manage") ? (
                        <Link href={`/settings/roles/${role.id}/edit`} className="hover:underline">
                          {role.name}
                        </Link>
                      ) : (
                        role.name
                      )}
                      {role.isSystem ? (
                        <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                          {dict.roles.system}
                        </span>
                      ) : null}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-[var(--muted-foreground)]">{role.description ?? "—"}</td>
                  <td className="px-6 py-3 text-[var(--muted-foreground)]">{role.permissions.length}</td>
                  <td className="px-6 py-3 text-[var(--muted-foreground)]">{role._count.users}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
