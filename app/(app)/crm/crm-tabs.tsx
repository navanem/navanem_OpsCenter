"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/provider";

export function CrmTabs() {
  const pathname = usePathname();
  const t = useT();
  const onLeads = pathname.startsWith("/crm/leads");
  const tabs = [
    { href: "/crm", label: t.crm.pipeline, active: !onLeads },
    { href: "/crm/leads", label: t.crm.leads, active: onLeads },
  ];
  return (
    <div className="flex gap-1 border-b border-[var(--border)]">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={
            "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition " +
            (tab.active
              ? "border-[var(--primary)] text-[var(--foreground)]"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]")
          }
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
