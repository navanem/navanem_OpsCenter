import { logoutAction } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";

export function Topbar({
  name,
  roleName,
}: {
  name: string;
  roleName: string;
}) {
  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] px-8 py-4">
      <div className="text-sm text-[var(--muted-foreground)]">
        Signed in as <span className="text-[var(--foreground)]">{name}</span>
        <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs">
          {roleName}
        </span>
      </div>
      <form action={logoutAction}>
        <Button variant="outline" type="submit">
          Sign out
        </Button>
      </form>
    </header>
  );
}
