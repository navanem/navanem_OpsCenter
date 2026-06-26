import Link from "next/link";
import { logoutAction } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { ThemeToggle } from "./theme-toggle";

export function Topbar({
  name,
  roleName,
  t,
}: {
  name: string;
  roleName: string;
  t: Dictionary["topbar"];
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
        <ThemeToggle labels={{ toLight: t.switchToLight, toDark: t.switchToDark }} />
        <Link href="/settings/security" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          {t.security}
        </Link>
        <form action={logoutAction}>
          <Button variant="outline" type="submit">
            {t.signOut}
          </Button>
        </form>
      </div>
    </header>
  );
}
