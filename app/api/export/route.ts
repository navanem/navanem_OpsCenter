import { getCurrentUser } from "@/lib/auth/current-user";
import { can } from "@/lib/rbac/can";
import { isContractsEnabled, isDevicesEnabled } from "@/lib/settings/service";
import { listClients } from "@/lib/clients/queries";
import { listDevices } from "@/lib/devices/queries";
import { listContracts } from "@/lib/contracts/queries";
import { formatContractReference } from "@/lib/contracts/meta";
import { formatDeviceReference } from "@/lib/devices/meta";
import { toCsv, type CsvCell } from "@/lib/export/csv";

const fmtDate = (d: Date | null | undefined) => (d ? new Date(d).toISOString().slice(0, 10) : "");

async function buildClientsCsv(): Promise<string> {
  const clients = await listClients({});
  const rows: CsvCell[][] = clients.map((c) => [
    c.companyName,
    c.domain ?? "",
    c.status,
    c.assignedTechnician ? `${c.assignedTechnician.firstName} ${c.assignedTechnician.lastName}` : "",
  ]);
  return toCsv(["Company", "Domain", "Status", "Technician"], rows);
}

async function buildDevicesCsv(): Promise<string> {
  const devices = await listDevices({});
  const rows: CsvCell[][] = devices.map((d) => [
    formatDeviceReference(d.number),
    d.name,
    d.type?.name ?? "",
    d.status?.name ?? "",
    d.client?.companyName ?? "",
    d.serialNumber ?? "",
    d.manufacturer ?? "",
    d.model ?? "",
    d.hostname ?? "",
    fmtDate(d.warrantyExpiry),
  ]);
  return toCsv(
    ["Reference", "Name", "Type", "Status", "Client", "Serial", "Manufacturer", "Model", "Hostname", "Warranty expiry"],
    rows,
  );
}

async function buildContractsCsv(): Promise<string> {
  const contracts = await listContracts({});
  const rows: CsvCell[][] = contracts.map((c) => [
    formatContractReference(c.number),
    c.client?.companyName ?? "",
    c.type?.name ?? "",
    c.status?.name ?? "",
    c.billingCycle,
    c.valueCents != null ? (c.valueCents / 100).toFixed(2) : "",
    fmtDate(c.startDate),
    fmtDate(c.endDate),
  ]);
  return toCsv(["Reference", "Client", "Type", "Status", "Billing cycle", "Value", "Start", "End"], rows);
}

export async function GET(request: Request): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return new Response("Forbidden", { status: 403 });

  const type = new URL(request.url).searchParams.get("type");

  let csv: string;
  switch (type) {
    case "clients":
      if (!can(user,"clients.read")) return new Response("Forbidden", { status: 403 });
      csv = await buildClientsCsv();
      break;
    case "devices":
      if (!can(user,"devices.read") || !(await isDevicesEnabled())) return new Response("Not found", { status: 404 });
      csv = await buildDevicesCsv();
      break;
    case "contracts":
      if (!can(user,"contracts.read") || !(await isContractsEnabled())) return new Response("Not found", { status: 404 });
      csv = await buildContractsCsv();
      break;
    default:
      return new Response("Bad request", { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}-${today}.csv"`,
    },
  });
}
