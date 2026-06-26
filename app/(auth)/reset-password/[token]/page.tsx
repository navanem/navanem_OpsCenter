import Link from "next/link";
import { prisma } from "@/lib/db";
import { hashResetToken } from "@/lib/auth/reset-token";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetForm } from "./reset-form";

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
  });
  const isValid = record && !record.usedAt && record.expiresAt >= new Date();

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{isValid ? "Set a new password" : "Reset link invalid"}</CardTitle>
        </CardHeader>
        <CardContent>
          {isValid ? (
            <ResetForm token={token} />
          ) : (
            <div className="flex flex-col gap-4 text-sm">
              <p className="text-[var(--muted-foreground)]">
                This reset link is invalid or has expired. Request a new one.
              </p>
              <Link href="/forgot-password" className="text-[var(--primary)] hover:underline">
                Request a new link
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
