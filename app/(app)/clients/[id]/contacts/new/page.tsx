import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { getClient } from "@/lib/clients/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContactForm } from "../contact-form";
import { createContactAction } from "../actions";

export default async function NewContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("clients.manage");
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "Clients", href: "/clients" },
          { label: client.companyName, href: `/clients/${id}` },
          { label: "New contact" },
        ]}
      />
      <h1 className="text-2xl font-semibold tracking-tight">New contact</h1>
      <Card>
        <CardHeader>
          <CardTitle>New contact</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactForm
            action={createContactAction}
            clientId={id}
            submitLabel="Add contact"
          />
        </CardContent>
      </Card>
    </div>
  );
}
