import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { getAppSettings } from "@/lib/settings/service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CmdbSettingsForm } from "./settings-form";

export default async function CmdbSettingsPage() {
  await requirePermission("settings.manage");
  const settings = await getAppSettings();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "CMDB" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">CMDB</h1>
      <Card>
        <CardHeader><CardTitle>Module</CardTitle></CardHeader>
        <CardContent><CmdbSettingsForm enabled={settings.cmdbEnabled} /></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
        <CardContent className="text-sm">
          <p>
            <Link href="/settings/taxonomies" className="text-[var(--primary)] hover:underline">Manage CI types and statuses</Link>{" "}
            <span className="text-[var(--muted-foreground)]">— in Settings → Taxonomies.</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
