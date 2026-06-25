import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { getUser } from "@/lib/users/queries";
import { listRoles } from "@/lib/roles/queries";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { UserForm } from "../../user-form";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("users.manage");
  const { id } = await params;

  const [user, roles] = await Promise.all([getUser(id), listRoles()]);

  if (!user) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Users", href: "/settings/users" }, { label: `${user.firstName} ${user.lastName}` }]} />
      <h1 className="text-2xl font-semibold tracking-tight">Edit user</h1>

      <div className="max-w-2xl">
        <Card className="p-6">
          <UserForm
            defaults={{
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone,
              roleId: user.roleId,
            }}
            roles={roles.map((r) => ({ id: r.id, name: r.name }))}
          />
        </Card>
      </div>
    </div>
  );
}
