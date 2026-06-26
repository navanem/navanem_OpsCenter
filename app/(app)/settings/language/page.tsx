import { requireUser } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { getAppSettings } from "@/lib/settings/service";
import { getDictionary } from "@/lib/i18n/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { LanguageSelect } from "./language-select";
import { updateMyLocaleAction, updateDefaultLocaleAction } from "./actions";

export default async function LanguageSettingsPage() {
  const [user, settings, dict] = await Promise.all([requireUser(), getAppSettings(), getDictionary()]);
  const t = dict.settings;
  const canManage = can(user, "settings.manage");

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: dict.settings.title, href: "/settings" }, { label: t.languageTitle }]} />
      <h1 className="text-2xl font-semibold tracking-tight">{t.languageTitle}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t.yourLanguage}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-[var(--muted-foreground)]">{t.yourLanguageHint}</p>
          <LanguageSelect action={updateMyLocaleAction} current={user.locale} />
        </CardContent>
      </Card>

      {canManage ? (
        <Card>
          <CardHeader>
            <CardTitle>{t.orgDefault}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-[var(--muted-foreground)]">{t.orgDefaultHint}</p>
            <LanguageSelect action={updateDefaultLocaleAction} current={settings.defaultLocale} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
