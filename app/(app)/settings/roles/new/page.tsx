import { requirePermission } from "@/lib/auth/guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { RoleForm } from "../role-form";
import { createRoleAction } from "../actions";

export default async function NewRolePage() {
  await requirePermission("roles.manage");

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Roles", href: "/settings/roles" }, { label: "New role" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">New role</h1>
      <Card>
        <CardHeader>
          <CardTitle>Role details</CardTitle>
        </CardHeader>
        <CardContent>
          <RoleForm action={createRoleAction} submitLabel="Create role" />
        </CardContent>
      </Card>
    </div>
  );
}
