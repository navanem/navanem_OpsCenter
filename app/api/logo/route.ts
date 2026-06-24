import { getAppSettings } from "@/lib/settings/service";

export async function GET() {
  const settings = await getAppSettings();
  if (!settings.logoData || !settings.logoMimeType) {
    return new Response("Not found", { status: 404 });
  }
  const body = new Uint8Array(settings.logoData);
  return new Response(body, {
    headers: {
      "Content-Type": settings.logoMimeType,
      "Cache-Control": "no-store",
    },
  });
}
