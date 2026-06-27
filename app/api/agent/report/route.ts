import { prisma } from "@/lib/db";

function toInt(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? Math.round(n) : null;
}
function toFloat(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : NaN;
  return Number.isFinite(n) ? n : null;
}
function toStr(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v.trim().slice(0, 255) : null;
}

// Receives a metrics snapshot from a device's monitoring agent, authenticated by a per-device token.
// This route is exempt from staff-session auth in proxy.ts (token-authenticated instead).
export async function POST(request: Request): Promise<Response> {
  const token = request.headers.get("x-agent-token");
  if (!token) return Response.json({ error: "Missing agent token" }, { status: 401 });

  const device = await prisma.device.findFirst({ where: { agentToken: token }, select: { id: true } });
  if (!device) return Response.json({ error: "Invalid agent token" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  await prisma.device.update({
    where: { id: device.id },
    data: {
      lastSeenAt: new Date(),
      agentVersion: toStr(body.agentVersion),
      hostname: toStr(body.hostname) ?? undefined,
      ipAddress: toStr(body.ipAddress),
      osName: toStr(body.osName),
      osVersion: toStr(body.osVersion),
      cpuModel: toStr(body.cpuModel),
      cpuPhysical: toInt(body.cpuPhysical),
      cpuLogical: toInt(body.cpuLogical),
      cpuFreqMhz: toInt(body.cpuFreqMhz),
      cpuUsagePct: toFloat(body.cpuUsagePct),
      ramTotalMb: toInt(body.ramTotalMb),
      ramUsedMb: toInt(body.ramUsedMb),
      diskTotalMb: toInt(body.diskTotalMb),
      diskUsedMb: toInt(body.diskUsedMb),
    },
  });

  return Response.json({ ok: true });
}
