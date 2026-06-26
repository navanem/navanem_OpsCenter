import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { getAppSettings } from "@/lib/settings/service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContractSettingsForm } from "./settings-form";

export default async function ContractSettingsPage() {
  await requirePermission("settings.manage");
  const settings = await getAppSettings();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Contracts" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">Contracts</h1>
      <Card>
        <CardHeader>
          <CardTitle>Module</CardTitle>
        </CardHeader>
        <CardContent>
          <ContractSettingsForm enabled={settings.contractsEnabled} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <Link href="/settings/contract-types" className="text-[var(--primary)] hover:underline">
              Manage contract types
            </Link>{" "}
            <span className="text-[var(--muted-foreground)]">— names, colors, and default hourly rates.</span>
          </p>
          <p>
            <Link href="/settings/taxonomies" className="text-[var(--primary)] hover:underline">
              Manage contract statuses
            </Link>{" "}
            <span className="text-[var(--muted-foreground)]">— in Settings → Taxonomies.</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
