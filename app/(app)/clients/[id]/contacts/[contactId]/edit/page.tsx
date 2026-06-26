import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { getContact } from "@/lib/contacts/queries";
import { getClient } from "@/lib/clients/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContactForm } from "../../contact-form";
import { updateContactAction } from "../../actions";

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string; contactId: string }>;
}) {
  await requirePermission("clients.manage");
  const { id, contactId } = await params;
  const contact = await getContact(contactId);
  if (!contact || contact.clientId !== id) notFound();
  const client = await getClient(id);
  if (!client) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Clients", href: "/clients" },
          { label: client.companyName, href: `/clients/${id}` },
          { label: `${contact.firstName} ${contact.lastName}` },
        ]}
      />
      <h1 className="text-2xl font-semibold tracking-tight">
        {contact.firstName} {contact.lastName}
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Edit contact</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactForm
            action={updateContactAction}
            clientId={id}
            defaults={{
              id: contact.id,
              firstName: contact.firstName,
              lastName: contact.lastName,
              jobTitle: contact.jobTitle,
              email: contact.email,
              phone: contact.phone,
              isVip: contact.isVip,
              hasPhoto: Boolean(contact.photoData),
              portalCanCreate: contact.portalCanCreate,
              portalCanComment: contact.portalCanComment,
            }}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
