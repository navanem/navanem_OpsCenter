import { can } from "@/lib/rbac/can";
import type { PermissionKey } from "@/lib/rbac/permissions";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { SidebarNav, type IconName } from "./sidebar-nav";

type NavKey = keyof Dictionary["nav"];

const items: { href: string; key: NavKey; icon: IconName; permission?: PermissionKey; flag?: "timesheeting" | "contracts" | "devices" }[] = [
  { href: "/dashboard", key: "dashboard", icon: "dashboard" },
  { href: "/clients", key: "clients", icon: "clients", permission: "clients.read" },
  { href: "/tickets", key: "tickets", icon: "tickets", permission: "tickets.read" },
  { href: "/projects", key: "projects", icon: "projects", permission: "projects.read" },
  { href: "/planning", key: "planning", icon: "planning", permission: "visits.read" },
  { href: "/contracts", key: "contracts", icon: "contracts", permission: "contracts.read", flag: "contracts" },
  { href: "/devices", key: "devices", icon: "devices", permission: "devices.read", flag: "devices" },
  { href: "/knowledge", key: "knowledge", icon: "knowledge", permission: "knowledge.read" },
  { href: "/timesheets", key: "timesheets", icon: "timesheets", permission: "timesheets.read", flag: "timesheeting" },
  { href: "/settings", key: "settings", icon: "settings", permission: "settings.manage" },
];

interface SidebarProps {
  permissions: string[];
  brandName: string;
  hasLogo: boolean;
  timesheetingEnabled: boolean;
  contractsEnabled: boolean;
  devicesEnabled: boolean;
  nav: Dictionary["nav"];
}

export function Sidebar({ permissions, brandName, hasLogo, timesheetingEnabled, contractsEnabled, devicesEnabled, nav }: SidebarProps) {
  const user = { id: "", email: "", permissions };
  const flagOn = { timesheeting: timesheetingEnabled, contracts: contractsEnabled, devices: devicesEnabled };
  const visible = items.filter(
    (i) =>
      (!i.permission || can(user, i.permission)) &&
      (!i.flag || flagOn[i.flag]),
  );
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
      <SidebarNav items={visible.map(({ href, key, icon }) => ({ href, label: nav[key], icon }))} />
    </aside>
  );
}
