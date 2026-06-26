import Link from "next/link";
import { requireUser } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { getDashboardStats, getMyWork, getModuleCounts, getExpiringSoon } from "@/lib/dashboard/queries";
import { getAppSettings } from "@/lib/settings/service";
import { formatMoneyCents, formatContractReference } from "@/lib/contracts/meta";
import { formatDeviceReference } from "@/lib/devices/meta";
import { TICKET_STATUS_META, formatTicketReference } from "@/lib/tickets/meta";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { PriorityBadge } from "@/components/tickets/badges";
import { getDictionary } from "@/lib/i18n/server";

export default async function DashboardPage() {
  const user = await requireUser();
  const [stats, myWork, moduleCounts, settings, dict] = await Promise.all([
    getDashboardStats(),
    getMyWork(user.id),
    getModuleCounts(),
    getAppSettings(),
    getDictionary(),
  ]);
  const td = dict.dashboard;

  const showContracts = can(user, "contracts.read") && settings.contractsEnabled;
  const showDevices = can(user, "devices.read") && settings.devicesEnabled;
  const expiring = showContracts || showDevices ? await getExpiringSoon() : { contracts: [], devices: [] };
  const expiringContracts = showContracts ? expiring.contracts : [];
  const expiringDevices = showDevices ? expiring.devices : [];
  const hasAttention = expiringContracts.length + expiringDevices.length > 0;
  const dateFmt = (d: Date) => new Date(d).toLocaleDateString();

  const moduleCards: { label: string; value: string | number; color: string }[] = [];
  if (can(user, "projects.read")) moduleCards.push({ label: td.projects, value: moduleCounts.projects, color: "#3b82f6" });
  if (can(user, "visits.read")) moduleCards.push({ label: td.visitsThisWeek, value: moduleCounts.visitsThisWeek, color: "#8b5cf6" });
  if (can(user, "contracts.read") && settings.contractsEnabled) moduleCards.push({ label: td.monthlyRecurring, value: formatMoneyCents(moduleCounts.contractsMrrCents), color: "#10b981" });
  if (can(user, "devices.read") && settings.devicesEnabled) moduleCards.push({ label: td.devices, value: moduleCounts.devices, color: "#f59e0b" });
  if (can(user, "knowledge.read")) moduleCards.push({ label: td.kbArticles, value: moduleCounts.kbPublished, color: "#6d5efc" });
  const hasMyWork = myWork.myTickets.length + myWork.myTasks.length + myWork.myVisits.length > 0;
  const timeFmt: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hour12: false };

  const canClients = can(user, "clients.read");
  const canTickets = can(user, "tickets.read");
  const canUsers = can(user, "users.read");
  const hasAny = canClients || canTickets || canUsers;

  // Build KPI card list
  const kpiCards: { label: string; value: number; sublabel?: string; color: string }[] = [];
  if (canClients) {
    kpiCards.push({
      label: td.clients,
      value: stats.clientsTotal,
      sublabel: `${stats.clientsActive} ${td.activeSuffix}`,
      color: "#6d5efc",
    });
  }
  if (canTickets) {
    kpiCards.push({ label: td.openTickets, value: stats.openTickets, color: "#3b82f6" });
    kpiCards.push({ label: td.totalTickets, value: stats.ticketsTotal, color: "#10b981" });
  }
  if (canUsers) {
    kpiCards.push({ label: td.teamMembers, value: stats.usersTotal, color: "#f59e0b" });
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
      <h1 className="text-2xl font-semibold tracking-tight">{td.title}</h1>

      {/* My work */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          {td.myWork}
        </h2>
        {!hasMyWork ? (
          <Card>
            <CardContent>
              <p className="text-sm text-[var(--muted-foreground)]">
                {td.myWorkEmpty}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>{td.myTickets} ({myWork.myTickets.length})</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {myWork.myTickets.length === 0 ? (
                  <p className="text-[var(--muted-foreground)]">{td.noOpenTickets}</p>
                ) : (
                  <ul className="space-y-2">
                    {myWork.myTickets.map((t) => (
                      <li key={t.id} className="flex items-center justify-between gap-2">
                        <Link href={`/tickets/${t.id}`} className="min-w-0 flex items-center gap-2 hover:underline">
                          <span className="font-mono text-xs text-[var(--muted-foreground)] shrink-0">{formatTicketReference(t.number)}</span>
                          <span className="truncate">{t.subject}</span>
                        </Link>
                        <span className="shrink-0">
                          {t.dueAt ? (
                            <span className="text-xs text-[var(--muted-foreground)]">{new Date(t.dueAt).toLocaleDateString()}</span>
                          ) : (
                            <PriorityBadge name={t.priority.name} color={t.priority.color} />
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{td.myTasks} ({myWork.myTasks.length})</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {myWork.myTasks.length === 0 ? (
                  <p className="text-[var(--muted-foreground)]">{td.noOpenTasks}</p>
                ) : (
                  <ul className="space-y-2">
                    {myWork.myTasks.map((t) => (
                      <li key={t.id} className="flex items-center justify-between gap-2">
                        <Link href={`/projects/${t.project.id}/tasks/${t.id}/edit`} className="min-w-0 flex items-center gap-2 hover:underline">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: t.status.color }} />
                          <span className="truncate">{t.title}</span>
                        </Link>
                        <span className="shrink-0 text-xs text-[var(--muted-foreground)]">
                          {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : t.project.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{td.upcomingVisits} ({myWork.myVisits.length})</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {myWork.myVisits.length === 0 ? (
                  <p className="text-[var(--muted-foreground)]">{td.noUpcomingVisits}</p>
                ) : (
                  <ul className="space-y-2">
                    {myWork.myVisits.map((v) => (
                      <li key={v.id} className="flex items-center justify-between gap-2">
                        <Link href={`/planning/visits/${v.id}/edit`} className="min-w-0 flex items-center gap-2 hover:underline">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: v.type.color ?? "#6b7280" }} />
                          <span className="truncate">{v.title}</span>
                        </Link>
                        <span className="shrink-0 text-xs text-[var(--muted-foreground)]">
                          {new Date(v.scheduledAt).toLocaleDateString()} {new Date(v.scheduledAt).toLocaleTimeString([], timeFmt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {moduleCards.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{td.acrossModules}</h2>
          <StatGrid>
            {moduleCards.map((c) => (
              <StatCard key={c.label} label={c.label} value={c.value} color={c.color} />
            ))}
          </StatGrid>
        </section>
      ) : null}

      {hasAttention ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{td.attentionNeeded}</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {showContracts ? (
              <Card>
                <CardHeader>
                  <CardTitle>{td.contractsEndingSoon} ({expiringContracts.length})</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {expiringContracts.length === 0 ? (
                    <p className="text-[var(--muted-foreground)]">{td.noContractsEnding}</p>
                  ) : (
                    <ul className="space-y-2">
                      {expiringContracts.map((c) => (
                        <li key={c.id} className="flex items-center justify-between gap-2">
                          <Link href={`/contracts/${c.id}/edit`} className="min-w-0 flex items-center gap-2 hover:underline">
                            <span className="font-mono text-xs text-[var(--muted-foreground)] shrink-0">{formatContractReference(c.number)}</span>
                            <span className="truncate">{c.client.companyName}{c.type ? ` · ${c.type.name}` : ""}</span>
                          </Link>
                          {c.endDate ? <span className="shrink-0 text-xs font-medium text-[#f59e0b]">{dateFmt(c.endDate)}</span> : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ) : null}

            {showDevices ? (
              <Card>
                <CardHeader>
                  <CardTitle>{td.warrantiesExpiring} ({expiringDevices.length})</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {expiringDevices.length === 0 ? (
                    <p className="text-[var(--muted-foreground)]">{td.noWarrantiesExpiring}</p>
                  ) : (
                    <ul className="space-y-2">
                      {expiringDevices.map((d) => (
                        <li key={d.id} className="flex items-center justify-between gap-2">
                          <Link href={`/devices/${d.id}/edit`} className="min-w-0 flex items-center gap-2 hover:underline">
                            <span className="font-mono text-xs text-[var(--muted-foreground)] shrink-0">{formatDeviceReference(d.number)}</span>
                            <span className="truncate">{d.name}{d.client ? ` · ${d.client.companyName}` : ""}</span>
                          </Link>
                          {d.warrantyExpiry ? <span className="shrink-0 text-xs font-medium text-[#f59e0b]">{dateFmt(d.warrantyExpiry)}</span> : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </section>
      ) : null}

      {!hasAny ? (
        <Card>
          <CardHeader>
            <CardTitle>{td.welcomeTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--muted-foreground)]">
              {td.welcomeBody}
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
                  <CardTitle>{td.ticketsByStatus}</CardTitle>
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
                  <CardTitle>{td.recentTickets}</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recentTickets.length === 0 ? (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {td.noTicketsYet}
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
