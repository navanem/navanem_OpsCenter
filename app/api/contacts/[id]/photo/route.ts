import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const contact = await prisma.clientContact.findUnique({ where: { id } });
  if (!contact?.photoData || !contact.photoMimeType) {
    return new Response("Not found", { status: 404 });
  }
  const body = new Uint8Array(contact.photoData);
  return new Response(body, {
    headers: { "Content-Type": contact.photoMimeType, "Cache-Control": "no-store" },
  });
}
