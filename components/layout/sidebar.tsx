import { can } from "@/lib/rbac/can";
import type { PermissionKey } from "@/lib/rbac/permissions";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { SidebarNav, type IconName } from "./sidebar-nav";

type NavKey = keyof Dictionary["nav"];
type GroupKey = "overview" | "operations" | "customers" | "system";

const items: { href: string; key: NavKey; icon: IconName; group: GroupKey; permission?: PermissionKey; flag?: "timesheeting" | "contracts" | "devices" | "subscriptions" | "changes" | "cmdb" | "crm" | "problems" | "releases" }[] = [
  { href: "/dashboard", key: "dashboard", icon: "dashboard", group: "overview" },
  { href: "/tickets", key: "tickets", icon: "tickets", group: "operations", permission: "tickets.read" },
  { href: "/changes", key: "changes", icon: "contracts", group: "operations", permission: "changes.read", flag: "changes" },
  { href: "/problems", key: "problems", icon: "tickets", group: "operations", permission: "problems.read", flag: "problems" },
  { href: "/releases", key: "releases", icon: "projects", group: "operations", permission: "releases.read", flag: "releases" },
  { href: "/projects", key: "projects", icon: "projects", group: "operations", permission: "projects.read" },
  { href: "/planning", key: "planning", icon: "planning", group: "operations", permission: "visits.read" },
  { href: "/timesheets", key: "timesheets", icon: "timesheets", group: "operations", permission: "timesheets.read", flag: "timesheeting" },
  { href: "/knowledge", key: "knowledge", icon: "knowledge", group: "operations", permission: "knowledge.read" },
  { href: "/crm", key: "crm", icon: "clients", group: "customers", permission: "crm.read", flag: "crm" },
  { href: "/clients", key: "clients", icon: "clients", group: "customers", permission: "clients.read" },
  { href: "/contracts", key: "contracts", icon: "contracts", group: "customers", permission: "contracts.read", flag: "contracts" },
  { href: "/subscriptions", key: "subscriptions", icon: "contracts", group: "customers", permission: "subscriptions.read", flag: "subscriptions" },
  { href: "/devices", key: "devices", icon: "devices", group: "customers", permission: "devices.read", flag: "devices" },
  { href: "/cmdb", key: "cmdb", icon: "devices", group: "customers", permission: "cmdb.read", flag: "cmdb" },
  { href: "/settings", key: "settings", icon: "settings", group: "system", permission: "settings.manage" },
];

const GROUP_ORDER: GroupKey[] = ["overview", "operations", "customers", "system"];

interface SidebarProps {
  permissions: string[];
  brandName: string;
  hasLogo: boolean;
  timesheetingEnabled: boolean;
  contractsEnabled: boolean;
  devicesEnabled: boolean;
  subscriptionsEnabled: boolean;
  changesEnabled: boolean;
  cmdbEnabled: boolean;
  crmEnabled: boolean;
  problemsEnabled: boolean;
  releasesEnabled: boolean;
  nav: Dictionary["nav"];
  navGroups: Dictionary["navGroups"];
}

export function Sidebar({ permissions, brandName, hasLogo, timesheetingEnabled, contractsEnabled, devicesEnabled, subscriptionsEnabled, changesEnabled, cmdbEnabled, crmEnabled, problemsEnabled, releasesEnabled, nav, navGroups }: SidebarProps) {
  const user = { id: "", email: "", permissions };
  const flagOn = { timesheeting: timesheetingEnabled, contracts: contractsEnabled, devices: devicesEnabled, subscriptions: subscriptionsEnabled, changes: changesEnabled, cmdb: cmdbEnabled, crm: crmEnabled, problems: problemsEnabled, releases: releasesEnabled };
  const visible = items.filter(
    (i) =>
      (!i.permission || can(user, i.permission)) &&
      (!i.flag || flagOn[i.flag]),
  );

  // Group labels by key; "overview" has no header.
  const groupLabel: Record<GroupKey, string | null> = {
    overview: null,
    operations: navGroups.operations,
    customers: navGroups.customers,
    system: navGroups.system,
  };
  const groups = GROUP_ORDER.map((g) => ({
    label: groupLabel[g],
    items: visible.filter((i) => i.group === g).map(({ href, key, icon }) => ({ href, label: nav[key], icon })),
  })).filter((grp) => grp.items.length > 0);
  return (
    <aside className="w-60 shrink-0 border-r border-[var(--border)] bg-[var(--card)] p-4">
      <div className="pb-4 mb-2 border-b border-[var(--border)] px-2">
        {hasLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/api/logo" alt={brandName} className="h-7 w-auto" />
        ) : (
          <span className="text-lg font-semibold tracking-tight">{brandName}</span>
        )}
      </div>
      <SidebarNav groups={groups} />
    </aside>
  );
}
