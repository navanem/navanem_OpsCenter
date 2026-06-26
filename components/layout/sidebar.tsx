import { can } from "@/lib/rbac/can";
import type { PermissionKey } from "@/lib/rbac/permissions";
import { SidebarNav, type IconName } from "./sidebar-nav";

const items: { href: string; label: string; icon: IconName; permission?: PermissionKey; flag?: "timesheeting" | "contracts" | "devices" }[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/clients", label: "Clients", icon: "clients", permission: "clients.read" },
  { href: "/tickets", label: "Tickets", icon: "tickets", permission: "tickets.read" },
  { href: "/projects", label: "Projects", icon: "projects", permission: "projects.read" },
  { href: "/planning", label: "Planning", icon: "planning", permission: "visits.read" },
  { href: "/contracts", label: "Contracts", icon: "contracts", permission: "contracts.read", flag: "contracts" },
  { href: "/devices", label: "Devices", icon: "devices", permission: "devices.read", flag: "devices" },
  { href: "/knowledge", label: "Knowledge", icon: "knowledge", permission: "knowledge.read" },
  { href: "/timesheets", label: "Timesheets", icon: "timesheets", permission: "timesheets.read", flag: "timesheeting" },
  { href: "/settings", label: "Settings", icon: "settings", permission: "settings.manage" },
];

interface SidebarProps {
  permissions: string[];
  brandName: string;
  hasLogo: boolean;
  timesheetingEnabled: boolean;
  contractsEnabled: boolean;
  devicesEnabled: boolean;
}

export function Sidebar({ permissions, brandName, hasLogo, timesheetingEnabled, contractsEnabled, devicesEnabled }: SidebarProps) {
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
      <SidebarNav items={visible.map(({ href, label, icon }) => ({ href, label, icon }))} />
    </aside>
  );
}
