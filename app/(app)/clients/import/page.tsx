import { requirePermission } from "@/lib/auth/guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ImportForm } from "./import-form";

export default async function ImportClientsPage() {
  await requirePermission("clients.manage");

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Clients", href: "/clients" }, { label: "Import" }]} />
      <h1 className="text-2xl font-semibold tracking-tight">Import clients</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload a CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-[var(--muted-foreground)]">
            The first row must be a header. Recognized columns: <span className="font-mono">Company</span> (required),{" "}
            <span className="font-mono">Domain</span>, <span className="font-mono">Status</span> (ACTIVE or INACTIVE,
            defaults to ACTIVE). Other columns are ignored. Tip: export the clients list to see the format.
          </p>
          <ImportForm />
        </CardContent>
      </Card>
    </div>
  );
}
