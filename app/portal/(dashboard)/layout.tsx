import Link from "next/link";
import { requireContact } from "@/lib/portal/current-contact";
import { getAppSettings } from "@/lib/settings/service";
import { getDictionary } from "@/lib/i18n/server";
import { LanguageSelect } from "@/app/(app)/settings/language/language-select";
import { Footer } from "@/components/layout/footer";
import { portalSignOutAction, updatePortalLocaleAction } from "./actions";

export default async function PortalDashboardLayout({ children }: { children: React.ReactNode }) {
  const [contact, settings, dict] = await Promise.all([requireContact(), getAppSettings(), getDictionary()]);
  const t = dict.portal;

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <span className="font-semibold tracking-tight">
            {settings.companyName} <span className="text-[var(--muted-foreground)] font-normal">· Client portal</span>
          </span>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[var(--muted-foreground)]">
              {contact.firstName} {contact.lastName} · {contact.clientName}
            </span>
            <LanguageSelect action={updatePortalLocaleAction} current={contact.locale} />
            <form action={portalSignOutAction}>
              <button type="submit" className="rounded-[var(--radius)] border border-[var(--border)] px-3 py-1.5 hover:bg-[var(--muted)]">
                {t.signOut}
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-4xl gap-4 px-6 pb-2 text-sm">
          <Link href="/portal" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">{t.tickets}</Link>
          <Link href="/portal/knowledge" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">{t.knowledgeBase}</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl space-y-6 p-6">{children}</main>
      <Footer />
    </div>
  );
}
