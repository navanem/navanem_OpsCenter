import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readTotpChallenge } from "@/lib/auth/totp-challenge";
import { VerifyForm } from "./verify-form";

export default async function LoginVerifyPage() {
  const userId = await readTotpChallenge();
  if (!userId) redirect("/login");

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Two-factor authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-[var(--muted-foreground)]">
            Enter the 6-digit code from your authenticator app.
          </p>
          <VerifyForm />
        </CardContent>
      </Card>
    </main>
  );
}
