import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { listRecurringVisits } from "@/lib/planning/queries";
import { FREQUENCIES } from "@/lib/planning/meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TypeDot } from "@/components/planning/badges";

function frequencyLabel(frequency: string, interval: number): string {
  const f = FREQUENCIES.find((x) => x.value === frequency);
  return `${f?.label ?? frequency} ×${interval}`;
}

export default async function RecurringVisitsPage() {
  const user = await requirePermission("visits.read");
  const series = await listRecurringVisits();
  const canManage = can(user, "visits.manage");

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Planning", href: "/planning" }, { label: "Recurring visits" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Recurring visits</h1>
        {canManage ? (
          <Link href="/planning/recurring/new">
            <Button>New recurring visit</Button>
          </Link>
        ) : null}
      </div>

      <Card>
        {series.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">No recurring visits yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Title</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Type</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Frequency</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Client</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Technician</th>
                <th scope="col" className="px-6 py-3 text-xs font-medium uppercase tracking-wide">Occurrences</th>
              </tr>
            </thead>
            <tbody>
              {series.map((rv) => (
                <tr key={rv.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/40">
                  <td className="px-6 py-3">
                    {canManage ? (
                      <Link href={`/planning/recurring/${rv.id}/edit`} className="font-medium text-[var(--foreground)] hover:underline">
                        {rv.title}
                      </Link>
                    ) : (
                      <span className="font-medium">{rv.title}</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <TypeDot color={rv.type.color ?? "#6b7280"} />
                      {rv.type.name}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-[var(--muted-foreground)]">{frequencyLabel(rv.frequency, rv.interval)}</td>
                  <td className="px-6 py-3 text-[var(--muted-foreground)]">{rv.client?.companyName ?? "—"}</td>
                  <td className="px-6 py-3 text-[var(--muted-foreground)]">
                    {rv.assignee ? `${rv.assignee.firstName} ${rv.assignee.lastName}` : "Unassigned"}
                  </td>
                  <td className="px-6 py-3 text-[var(--muted-foreground)]">{rv._count.visits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
