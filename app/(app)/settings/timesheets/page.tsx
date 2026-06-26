import { requirePermission } from "@/lib/auth/guard";
import { getAppSettings } from "@/lib/settings/service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TimesheetSettingsForm } from "./settings-form";

export default async function TimesheetSettingsPage() {
  await requirePermission("settings.manage");
  const settings = await getAppSettings();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Timesheets" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">Timesheets</h1>
      <Card>
        <CardHeader>
          <CardTitle>Module</CardTitle>
        </CardHeader>
        <CardContent>
          <TimesheetSettingsForm
            enabled={settings.timesheetingEnabled}
            defaultHourlyRate={
              settings.defaultHourlyRateCents != null
                ? (settings.defaultHourlyRateCents / 100).toFixed(2)
                : ""
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
