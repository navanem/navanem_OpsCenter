import { can } from "@/lib/rbac/can";
import type { PermissionKey } from "@/lib/rbac/permissions";
import { SidebarNav } from "./sidebar-nav";

const items: { href: string; label: string; permission?: PermissionKey; flag?: "timesheeting" | "contracts" | "devices" }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clients", label: "Clients", permission: "clients.read" },
  { href: "/tickets", label: "Tickets", permission: "tickets.read" },
  { href: "/projects", label: "Projects", permission: "projects.read" },
  { href: "/planning", label: "Planning", permission: "visits.read" },
  { href: "/contracts", label: "Contracts", permission: "contracts.read", flag: "contracts" },
  { href: "/devices", label: "Devices", permission: "devices.read", flag: "devices" },
  { href: "/knowledge", label: "Knowledge", permission: "knowledge.read" },
  { href: "/timesheets", label: "Timesheets", permission: "timesheets.read", flag: "timesheeting" },
  { href: "/settings", label: "Settings", permission: "settings.manage" },
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
      <SidebarNav items={visible.map(({ href, label }) => ({ href, label }))} />
    </aside>
  );
}
