import Link from "next/link";
import { requireUser } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { getDashboardStats } from "@/lib/dashboard/queries";
import { TICKET_STATUS_META, formatTicketReference } from "@/lib/tickets/meta";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { PriorityBadge } from "@/components/tickets/badges";

export default async function DashboardPage() {
  const user = await requireUser();
  const stats = await getDashboardStats();

  const canClients = can(user, "clients.read");
  const canTickets = can(user, "tickets.read");
  const canUsers = can(user, "users.read");
  const hasAny = canClients || canTickets || canUsers;

  // Build KPI card list
  const kpiCards: { label: string; value: number; sublabel?: string; color: string }[] = [];
  if (canClients) {
    kpiCards.push({
      label: "Clients",
      value: stats.clientsTotal,
      sublabel: `${stats.clientsActive} active`,
      color: "#6d5efc",
    });
  }
  if (canTickets) {
    kpiCards.push({ label: "Open tickets", value: stats.openTickets, color: "#3b82f6" });
    kpiCards.push({ label: "Total tickets", value: stats.ticketsTotal, color: "#10b981" });
  }
  if (canUsers) {
    kpiCards.push({ label: "Team members", value: stats.usersTotal, color: "#f59e0b" });
  }

  // Max count for status bar widths
  const statusEntries = Object.entries(TICKET_STATUS_META) as [
    keyof typeof TICKET_STATUS_META,
    (typeof TICKET_STATUS_META)[keyof typeof TICKET_STATUS_META],
  ][];
  const maxCount = Math.max(
    1,
    ...statusEntries.map(([key]) => stats.byStatus[key] ?? 0),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      {!hasAny ? (
        <Card>
          <CardHeader>
            <CardTitle>Welcome to OpsCenter</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--muted-foreground)]">
              You do not have access to any modules yet. Contact your
              administrator.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI grid */}
          <StatGrid>
            {kpiCards.map((card) => (
              <StatCard key={card.label} label={card.label} value={card.value} color={card.color} hint={card.sublabel} />
            ))}
          </StatGrid>

          {canTickets && (
            <>
              {/* Tickets by status */}
              <Card>
                <CardHeader>
                  <CardTitle>Tickets by status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statusEntries.map(([key, meta]) => {
                      const count = stats.byStatus[key] ?? 0;
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: meta.color }}
                              />
                              {meta.label}
                            </span>
                            <span className="tabular-nums text-[var(--muted-foreground)]">
                              {count}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-[var(--muted)]">
                            <div
                              className="h-1.5 rounded-full transition-all"
                              style={{
                                width: `${(count / maxCount) * 100}%`,
                                backgroundColor: meta.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recent tickets */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recentTickets.length === 0 ? (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      No tickets yet.
                    </p>
                  ) : (
                    <div className="divide-y divide-[var(--border)]">
                      {stats.recentTickets.map((t) => (
                        <div
                          key={t.id}
                          className="flex flex-wrap items-center gap-2 py-2.5"
                        >
                          <span className="inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 font-mono text-xs">
                            {formatTicketReference(t.number)}
                          </span>
                          <Link
                            href={`/tickets/${t.id}`}
                            className="flex-1 truncate font-medium hover:underline"
                          >
                            {t.subject}
                          </Link>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {t.client.companyName}
                          </span>
                          <PriorityBadge
                            name={t.priority.name}
                            color={t.priority.color}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
