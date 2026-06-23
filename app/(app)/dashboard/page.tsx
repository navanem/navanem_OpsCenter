import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
      <Card>
        <CardHeader>
          <CardTitle>Bienvenue sur OpsCenter</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[var(--muted-foreground)]">
            Le socle est en place. Les modules (authentification, clients,
            paramètres) arrivent dans les prochaines versions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
