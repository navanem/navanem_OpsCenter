import Link from "next/link";
import { requirePermission } from "@/lib/auth/guard";
import { can } from "@/lib/rbac/can";
import { listClients } from "@/lib/clients/queries";
import { listTechnicians } from "@/lib/users/queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClientsFilters } from "./clients-filters";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; technicianId?: string }>;
}) {
  const user = await requirePermission("clients.read");
  const sp = await searchParams;
  const status = sp.status === "ACTIVE" || sp.status === "INACTIVE" ? sp.status : undefined;

  const [clients, technicians] = await Promise.all([
    listClients({ search: sp.search, status, technicianId: sp.technicianId }),
    listTechnicians(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
        {can(user, "clients.manage") ? (
          <Link href="/clients/new">
            <Button>New client</Button>
          </Link>
        ) : null}
      </div>

      <ClientsFilters technicians={technicians} />

      <Card>
        {clients.length === 0 ? (
          <p className="p-6 text-[var(--muted-foreground)]">No clients found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="px-6 py-3 font-medium">Company</th>
                <th scope="col" className="px-6 py-3 font-medium">Domain</th>
                <th scope="col" className="px-6 py-3 font-medium">Technician</th>
                <th scope="col" className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-6 py-3">
                    <Link href={`/clients/${c.id}`} className="hover:underline">
                      {c.companyName}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-[var(--muted-foreground)]">{c.domain ?? "—"}</td>
                  <td className="px-6 py-3 text-[var(--muted-foreground)]">
                    {c.assignedTechnician
                      ? `${c.assignedTechnician.firstName} ${c.assignedTechnician.lastName}`
                      : "Unassigned"}
                  </td>
                  <td className="px-6 py-3">
                    <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs">
                      {c.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
