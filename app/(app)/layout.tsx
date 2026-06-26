import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAppSettings } from "@/lib/settings/service";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { I18nProvider } from "@/lib/i18n/provider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, settings, dict, locale] = await Promise.all([
    getCurrentUser(),
    getAppSettings(),
    getDictionary(),
    getLocale(),
  ]);
  if (!user) redirect("/login");
  // Forced 2FA onboarding: send users without 2FA to the setup screen (outside this layout, so no loop).
  if (settings.enforce2fa && !user.totpEnabled) redirect("/setup-2fa");

  return (
    <I18nProvider dict={dict} locale={locale}>
      <div className="flex min-h-screen">
        <Sidebar
          permissions={user.permissions}
          brandName={settings.companyName}
          hasLogo={Boolean(settings.logoData)}
          timesheetingEnabled={settings.timesheetingEnabled}
          contractsEnabled={settings.contractsEnabled}
          devicesEnabled={settings.devicesEnabled}
          subscriptionsEnabled={settings.subscriptionsEnabled}
          nav={dict.nav}
        />
        <div className="flex flex-1 flex-col">
          <Topbar name={`${user.firstName} ${user.lastName}`} roleName={user.roleName} t={dict.topbar} />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </I18nProvider>
  );
}
