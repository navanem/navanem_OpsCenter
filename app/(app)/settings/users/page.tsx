import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { listUsers } from "@/lib/users/queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { setUserStatusAction } from "./actions";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    INVITED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    SUSPENDED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  const labels: Record<string, string> = {
    ACTIVE: "Active",
    INVITED: "Invited",
    SUSPENDED: "Suspended",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

export default async function UsersPage() {
  const user = await requirePermission("users.read");
  const users = await listUsers();
  const canManage = can(user, "users.manage");

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Users" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        {canManage ? (
          <Link href="/settings/users/new">
            <Button>Invite user</Button>
          </Link>
        ) : null}
      </div>

      <Card>
        {users.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">No users.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-6 py-3 font-medium">Name</th>
                <th scope="col" className="px-6 py-3 font-medium">Email</th>
                <th scope="col" className="px-6 py-3 font-medium">Role</th>
                <th scope="col" className="px-6 py-3 font-medium">Status</th>
                {canManage ? (
                  <th scope="col" className="px-6 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {users.map((row) => {
                const isSelf = user.id === row.id;
                const toggleStatus = row.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
                const toggleLabel = row.status === "ACTIVE" ? "Suspend" : "Reactivate";

                return (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-6 py-3 font-medium">
                      {canManage ? (
                        <Link
                          href={`/settings/users/${row.id}/edit`}
                          className="hover:underline"
                        >
                          {row.firstName} {row.lastName}
                        </Link>
                      ) : (
                        <span>
                          {row.firstName} {row.lastName}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-[var(--muted-foreground)]">{row.email}</td>
                    <td className="px-6 py-3 text-[var(--muted-foreground)]">{row.role.name}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    {canManage ? (
                      <td className="px-6 py-3">
                        {!isSelf && row.status !== "INVITED" ? (
                          <form action={setUserStatusAction}>
                            <input type="hidden" name="id" value={row.id} />
                            <input type="hidden" name="status" value={toggleStatus} />
                            <button
                              type="submit"
                              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:underline"
                            >
                              {toggleLabel}
                            </button>
                          </form>
                        ) : null}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
