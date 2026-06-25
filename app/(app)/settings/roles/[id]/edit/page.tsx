import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { getRole } from "@/lib/roles/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { RoleForm } from "../../role-form";
import { updateRoleAction, deleteRoleAction } from "../../actions";

export default async function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("roles.manage");
  const { id } = await params;
  const role = await getRole(id);
  if (!role) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Roles", href: "/settings/roles" }, { label: role.name }]} />
      <h1 className="text-2xl font-semibold tracking-tight">Edit role</h1>
      <Card>
        <CardHeader>
          <CardTitle>{role.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <RoleForm
            action={updateRoleAction}
            defaults={{
              id: role.id,
              name: role.name,
              description: role.description,
              permissionKeys: role.permissions.map((p) => p.key),
            }}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>

      {!role.isSystem ? (
        <Card>
          <CardContent className="pt-6">
            <p className="mb-4 text-sm font-medium text-[var(--destructive)]">Danger zone</p>
            <form action={deleteRoleAction}>
              <input type="hidden" name="id" value={role.id} />
              <Button
                type="submit"
                className="bg-[var(--destructive)] text-white hover:opacity-90"
              >
                Delete role
              </Button>
            </form>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Deletion is blocked while users are assigned to this role.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
