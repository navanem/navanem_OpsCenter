import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDictionary } from "@/lib/i18n/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  if (await getCurrentUser()) redirect("/dashboard");
  const [{ reset }, dict] = await Promise.all([searchParams, getDictionary()]);
  const t = dict.auth;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t.signInTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {reset ? (
            <p className="mb-4 rounded-[var(--radius)] bg-green-100 px-3 py-2 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {t.passwordResetDone}
            </p>
          ) : null}
          <LoginForm
            labels={{
              email: t.email,
              password: t.password,
              signIn: t.signInButton,
              signingIn: t.signingIn,
              forgotPassword: t.forgotPassword,
            }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
