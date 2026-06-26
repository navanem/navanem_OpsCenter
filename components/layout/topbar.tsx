import { logoutAction } from "@/app/(auth)/login/actions";
import { setMyLocaleAction } from "@/app/(app)/settings/language/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { UserMenu } from "./user-menu";

export function Topbar({
  name,
  email,
  roleName,
  locale,
  dict,
}: {
  name: string;
  email: string;
  roleName: string;
  locale: string;
  dict: Dictionary;
}) {
  return (
    <header className="flex items-center justify-end border-b border-[var(--border)] px-6 py-3">
      <UserMenu
        name={name}
        email={email}
        roleName={roleName}
        locale={locale}
        labels={{
          account: dict.userMenu.account,
          language: dict.userMenu.language,
          theme: dict.userMenu.theme,
          light: dict.userMenu.light,
          dark: dict.userMenu.dark,
          security: dict.topbar.security,
          signOut: dict.topbar.signOut,
        }}
        setLocaleAction={setMyLocaleAction}
        logoutAction={logoutAction}
      />
    </header>
  );
}
