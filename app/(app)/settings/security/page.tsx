import QRCode from "qrcode";
import { requireUser } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { prisma } from "@/lib/db";
import { getAppSettings } from "@/lib/settings/service";
import { decryptSecret } from "@/lib/crypto/secret";
import { totpAuthUri } from "@/lib/auth/totp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { CodeForm } from "./code-form";
import {
  beginTotpSetupAction,
  cancelTotpSetupAction,
  enableTotpAction,
  disableTotpAction,
  regenerateBackupCodesAction,
  updateEnforce2faAction,
} from "./actions";

export default async function SecuritySettingsPage() {
  const user = await requireUser();
  const [record, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true, totpSecret: true, totpEnabled: true },
    }),
    getAppSettings(),
  ]);
  const canManageSettings = can(user, "settings.manage");

  const enabled = Boolean(record?.totpEnabled);
  const pendingSecret = !enabled && record?.totpSecret ? decryptSecret(record.totpSecret) : null;

  let qrDataUrl: string | null = null;
  if (pendingSecret && record?.email) {
    qrDataUrl = await QRCode.toDataURL(totpAuthUri(pendingSecret, record.email), { margin: 1, width: 200 });
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Security" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">Security</h1>

      <Card>
        <CardHeader>
          <CardTitle>Two-factor authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {enabled ? (
            <>
              <p className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#10b98122] px-2 py-0.5 text-xs font-medium text-[#10b981]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" /> On
                </span>
                Your account is protected by an authenticator app.
              </p>
              <div className="border-t border-[var(--border)] pt-4">
                <p className="mb-2 text-[var(--muted-foreground)]">Lost your backup codes? Enter a current code to generate a new set (the old ones stop working).</p>
                <CodeForm action={regenerateBackupCodesAction} submitLabel="Regenerate backup codes" />
              </div>
              <div className="border-t border-[var(--border)] pt-4">
                <p className="mb-2 text-[var(--muted-foreground)]">Enter a current code to turn it off.</p>
                <CodeForm action={disableTotpAction} submitLabel="Turn off 2FA" destructive />
              </div>
            </>
          ) : pendingSecret ? (
            <>
              <p className="text-[var(--muted-foreground)]">
                Scan this QR code with an authenticator app (Google Authenticator, 1Password, Authy…), then enter the 6-digit code to finish.
              </p>
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="2FA QR code" className="rounded-[var(--radius)] border border-[var(--border)] bg-white p-2" width={200} height={200} />
              ) : null}
              <p className="text-xs text-[var(--muted-foreground)]">
                Can&apos;t scan? Enter this key manually: <span className="font-mono break-all">{pendingSecret}</span>
              </p>
              <CodeForm action={enableTotpAction} submitLabel="Verify & enable" />
              <form action={cancelTotpSetupAction}>
                <Button type="submit" variant="ghost" size="sm">Cancel setup</Button>
              </form>
            </>
          ) : (
            <>
              <p className="text-[var(--muted-foreground)]">
                Add a second step at sign-in using an authenticator app. Recommended for all accounts.
              </p>
              <form action={beginTotpSetupAction}>
                <Button type="submit">Set up two-factor authentication</Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>

      {canManageSettings ? (
        <Card>
          <CardHeader>
            <CardTitle>Organization policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <form action={updateEnforce2faAction} className="flex flex-col gap-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="enforce2fa" value="true" defaultChecked={settings.enforce2fa} className="h-4 w-4 cursor-pointer" />
                Require two-factor authentication for all users
              </label>
              <p className="text-xs text-[var(--muted-foreground)]">
                When on, users without 2FA are prompted to set it up before they can use the app. Backup codes ensure no one is locked out.
              </p>
              <Button type="submit" variant="outline" className="self-start">Save policy</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
