import { requirePermission } from "@/lib/auth/guard";
import { listRoles } from "@/lib/roles/queries";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { InviteForm } from "../invite-form";

export default async function InviteUserPage() {
  await requirePermission("users.manage");
  const roles = await listRoles();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Users", href: "/settings/users" }, { label: "Invite user" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">Invite user</h1>

      <div className="max-w-2xl">
        <Card className="p-6">
          <p className="mb-6 text-sm text-[var(--muted-foreground)]">
            Fill in the details below. The invited user will set their own password via the
            generated setup link — email delivery will be added in a future release.
          </p>
          <InviteForm roles={roles.map((r) => ({ id: r.id, name: r.name }))} />
        </Card>
      </div>
    </div>
  );
}
