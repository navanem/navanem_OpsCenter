import "dotenv/config";

async function main() {
  const { prisma } = await import("@/lib/db");
  const { PERMISSIONS } = await import("@/lib/rbac/permissions");
  const { hashPassword } = await import("@/lib/auth/password");

  try {
    // 1. Permissions (idempotent upsert by key)
    for (const [key, meta] of Object.entries(PERMISSIONS)) {
      await prisma.permission.upsert({
        where: { key },
        update: { label: meta.label, group: meta.group },
        create: { key, label: meta.label, group: meta.group },
      });
    }

    // 2. Admin system role with all permissions
    const allPermissions = await prisma.permission.findMany();
    const adminRole = await prisma.role.upsert({
      where: { name: "Admin" },
      update: {
        isSystem: true,
        permissions: { set: allPermissions.map((p) => ({ id: p.id })) },
      },
      create: {
        name: "Admin",
        description: "Full system access",
        isSystem: true,
        permissions: { connect: allPermissions.map((p) => ({ id: p.id })) },
      },
    });

    // 3. Bootstrap admin user
    const email = process.env.ADMIN_EMAIL ?? "admin@opscenter.local";
    const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email,
          firstName: "System",
          lastName: "Admin",
          status: "ACTIVE",
          passwordHash: await hashPassword(password),
          roleId: adminRole.id,
        },
      });
      console.log(`Created admin user: ${email}`);
    } else {
      console.log(`Admin user already exists: ${email}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
