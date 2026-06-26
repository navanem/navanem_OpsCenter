import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAppSettings } from "@/lib/settings/service";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, settings] = await Promise.all([getCurrentUser(), getAppSettings()]);
  if (!user) redirect("/login");
  // Forced 2FA onboarding: send users without 2FA to the setup screen (outside this layout, so no loop).
  if (settings.enforce2fa && !user.totpEnabled) redirect("/setup-2fa");

  return (
    <div className="flex min-h-screen">
      <Sidebar
        permissions={user.permissions}
        brandName={settings.companyName}
        hasLogo={Boolean(settings.logoData)}
        timesheetingEnabled={settings.timesheetingEnabled}
        contractsEnabled={settings.contractsEnabled}
        devicesEnabled={settings.devicesEnabled}
      />
      <div className="flex flex-1 flex-col">
        <Topbar name={`${user.firstName} ${user.lastName}`} roleName={user.roleName} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
