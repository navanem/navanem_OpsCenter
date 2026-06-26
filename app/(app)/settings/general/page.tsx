import { requirePermission } from "@/lib/auth/guard";
import { getAppSettings } from "@/lib/settings/service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { GeneralForm } from "./general-form";

export default async function GeneralSettingsPage() {
  await requirePermission("settings.manage");
  const settings = await getAppSettings();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "General" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">General</h1>
      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
        </CardHeader>
        <CardContent>
          <GeneralForm
            companyName={settings.companyName}
            hasLogo={Boolean(settings.logoData)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
