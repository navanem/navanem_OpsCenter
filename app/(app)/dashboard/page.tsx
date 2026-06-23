import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to OpsCenter</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[var(--muted-foreground)]">
            The foundation is in place. Modules (authentication, clients,
            settings) arrive in upcoming releases.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
