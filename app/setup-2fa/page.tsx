import QRCode from "qrcode";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guard";
import { getAppSettings } from "@/lib/settings/service";
import { prisma } from "@/lib/db";
import { decryptSecret } from "@/lib/crypto/secret";
import { totpAuthUri } from "@/lib/auth/totp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeForm } from "@/app/(app)/settings/security/code-form";
import { enableTotpAction } from "@/app/(app)/settings/security/actions";
import { beginForcedSetupAction } from "./actions";

export default async function SetupTwoFactorPage() {
  const cu = await requireUser();
  const settings = await getAppSettings();
  // This screen only exists to satisfy an enforcement; otherwise go to the app.
  if (!settings.enforce2fa || cu.totpEnabled) redirect("/dashboard");

  const record = await prisma.user.findUnique({ where: { id: cu.id }, select: { email: true, totpSecret: true } });
  const pendingSecret = record?.totpSecret ? decryptSecret(record.totpSecret) : null;
  let qr: string | null = null;
  if (pendingSecret && record?.email) {
    qr = await QRCode.toDataURL(totpAuthUri(pendingSecret, record.email), { margin: 1, width: 200 });
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Two-factor authentication required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-[var(--muted-foreground)]">
            {settings.companyName} requires two-factor authentication for all accounts. Set it up to continue.
          </p>
          {pendingSecret ? (
            <>
              <p>Scan this QR code with an authenticator app, then enter the 6-digit code.</p>
              {qr ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qr} alt="2FA QR code" className="rounded-[var(--radius)] border border-[var(--border)] bg-white p-2" width={200} height={200} />
              ) : null}
              <p className="text-xs text-[var(--muted-foreground)]">Manual key: <span className="font-mono break-all">{pendingSecret}</span></p>
              <CodeForm action={enableTotpAction} submitLabel="Verify & enable" />
            </>
          ) : (
            <form action={beginForcedSetupAction}>
              <Button type="submit">Begin setup</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
