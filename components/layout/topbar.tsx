import Link from "next/link";
import { logoutAction } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

export function Topbar({
  name,
  roleName,
}: {
  name: string;
  roleName: string;
}) {
  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-[var(--foreground)]">{name}</span>
        <span className="rounded-full border border-[var(--border)] bg-[var(--muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted-foreground)]">
          {roleName}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link href="/settings/security" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          Security
        </Link>
        <form action={logoutAction}>
          <Button variant="outline" type="submit">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
