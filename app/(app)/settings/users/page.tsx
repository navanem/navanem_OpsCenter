import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { listUsers } from "@/lib/users/queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getDictionary } from "@/lib/i18n/server";
import { setUserStatusAction, resendInviteAction, revokeInviteAction } from "./actions";

function StatusBadge({ status, label }: { status: string; label: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    INVITED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    EXPIRED: "bg-[var(--muted)] text-[var(--muted-foreground)]",
    SUSPENDED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}
    >
      {label}
    </span>
  );
}

export default async function UsersPage() {
  const user = await requirePermission("users.read");
  const [users, dict] = await Promise.all([listUsers(), getDictionary()]);
  const canManage = can(user, "users.manage");
  const statusLabel: Record<string, string> = {
    ACTIVE: dict.users.statusActive,
    INVITED: dict.users.statusInvited,
    EXPIRED: dict.users.statusExpired,
    SUSPENDED: dict.users.statusSuspended,
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.settings.title, href: "/settings" }, { label: dict.settings.users }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{dict.settings.users}</h1>
        {canManage ? (
          <Link href="/settings/users/new">
            <Button>{dict.users.invite}</Button>
          </Link>
        ) : null}
      </div>

      <Card>
        {users.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">{dict.users.noneFound}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-6 py-3 font-medium">{dict.common.name}</th>
                <th scope="col" className="px-6 py-3 font-medium">{dict.common.email}</th>
                <th scope="col" className="px-6 py-3 font-medium">{dict.common.role}</th>
                <th scope="col" className="px-6 py-3 font-medium">{dict.common.status}</th>
                {canManage ? (
                  <th scope="col" className="px-6 py-3 font-medium">
                    <span className="sr-only">{dict.common.actions}</span>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {users.map((row) => {
                const isSelf = user.id === row.id;
                const toggleStatus = row.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
                const toggleLabel = row.status === "ACTIVE" ? dict.users.suspend : dict.users.reactivate;
                const invite = row.invitations[0];
                const inviteExpired =
                  row.status === "INVITED" && invite && invite.status === "PENDING" && new Date(invite.expiresAt) < new Date();
                const displayStatus = inviteExpired ? "EXPIRED" : row.status;

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
                      <StatusBadge status={displayStatus} label={statusLabel[displayStatus] ?? displayStatus} />
                    </td>
                    {canManage ? (
                      <td className="px-6 py-3">
                        {row.status === "INVITED" ? (
                          <div className="flex items-center gap-3">
                            <form action={resendInviteAction}>
                              <input type="hidden" name="id" value={row.id} />
                              <button type="submit" className="text-sm text-[var(--primary)] hover:underline">
                                {dict.users.resend}
                              </button>
                            </form>
                            <form action={revokeInviteAction}>
                              <input type="hidden" name="id" value={row.id} />
                              <button type="submit" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:underline">
                                {dict.users.revoke}
                              </button>
                            </form>
                          </div>
                        ) : !isSelf ? (
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
