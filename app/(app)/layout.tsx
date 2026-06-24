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

  return (
    <div className="flex min-h-screen">
      <Sidebar
        permissions={user.permissions}
        brandName={settings.companyName}
        hasLogo={Boolean(settings.logoData)}
      />
      <div className="flex flex-1 flex-col">
        <Topbar name={`${user.firstName} ${user.lastName}`} roleName={user.roleName} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
