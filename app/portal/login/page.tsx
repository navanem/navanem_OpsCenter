import { getAppSettings } from "@/lib/settings/service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalLoginForm } from "./login-form";

export default async function PortalLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ set?: string }>;
}) {
  const [settings, sp] = await Promise.all([getAppSettings(), searchParams]);
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{settings.companyName} — Client portal</CardTitle>
        </CardHeader>
        <CardContent>
          {sp.set ? (
            <p className="mb-4 rounded-[var(--radius)] bg-green-100 px-3 py-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Your password has been set. Sign in below.
            </p>
          ) : null}
          <PortalLoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
