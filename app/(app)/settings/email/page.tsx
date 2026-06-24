import { requirePermission } from "@/lib/auth/guard";
import { getAppSettings } from "@/lib/settings/service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmailForm } from "./email-form";

export default async function EmailSettingsPage() {
  await requirePermission("settings.manage");
  const settings = await getAppSettings();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Email (SMTP)</h1>
      <Card>
        <CardHeader>
          <CardTitle>SMTP configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <EmailForm
            settings={{
              smtpHost: settings.smtpHost ?? "",
              smtpPort: settings.smtpPort?.toString() ?? "",
              smtpUser: settings.smtpUser ?? "",
              smtpFrom: settings.smtpFrom ?? "",
              smtpSecure: settings.smtpSecure,
            }}
            hasPassword={Boolean(settings.smtpPasswordEnc)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
