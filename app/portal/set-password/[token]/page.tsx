import Link from "next/link";
import { prisma } from "@/lib/db";
import { hashPortalToken } from "@/lib/portal/token";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalSetForm } from "./set-form";

export default async function PortalSetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const record = await prisma.portalToken.findUnique({ where: { tokenHash: hashPortalToken(token) } });
  const isValid = record && !record.usedAt && record.expiresAt >= new Date();

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{isValid ? "Set your password" : "Link invalid"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isValid ? (
            <PortalSetForm token={token} />
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">
              This link is invalid or has expired. Please ask your contact to send a new portal invitation.{" "}
              <Link href="/portal/login" className="text-[var(--primary)] hover:underline">Back to sign in</Link>
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
