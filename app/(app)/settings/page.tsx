import Link from "next/link";
import { requireUser } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { Card } from "@/components/ui/card";

export default async function SettingsPage() {
  const user = await requireUser();

  const sections: { title: string; description: string; href: string; permission: "users.read" | "roles.read" }[] = [
    {
      title: "Users",
      description: "Manage user accounts, invite new users, and control access.",
      href: "/settings/users",
      permission: "users.read",
    },
    {
      title: "Roles",
      description: "Define roles and the permissions assigned to each role.",
      href: "/settings/roles",
      permission: "roles.read",
    },
  ];

  const visible = sections.filter((s) => can(user, s.permission));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      {visible.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">No settings sections available.</p>
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
