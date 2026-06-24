import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { hashInviteToken } from "@/lib/auth/invite-token";
import { AcceptForm } from "./accept-form";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function AcceptInvitePage({ params }: Props) {
  const { token } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash: hashInviteToken(token) },
    include: { user: true },
  });

  const isValid =
    invitation &&
    invitation.status === "PENDING" &&
    invitation.expiresAt >= new Date() &&
    invitation.userId;

  if (!isValid) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Invitation invalid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)]">
              This invitation is invalid or has expired.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Set up your account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-[var(--muted-foreground)]">Email</span>
            <span className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
              {invitation.user!.email}
            </span>
          </div>
          <AcceptForm token={token} />
        </CardContent>
      </Card>
    </main>
  );
}
