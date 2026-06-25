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

    // 4. Default ticket categories
    const ticketCategories = [
      { name: "Hardware", color: "#3b82f6", sortOrder: 1 },
      { name: "Software", color: "#8b5cf6", sortOrder: 2 },
      { name: "Network", color: "#06b6d4", sortOrder: 3 },
      { name: "Account", color: "#f59e0b", sortOrder: 4 },
      { name: "Other", color: "#6b7280", sortOrder: 5 },
    ];
    for (const c of ticketCategories) {
      await prisma.ticketCategory.upsert({ where: { name: c.name }, update: {}, create: c });
    }

    // 5. Default ticket priorities
    const ticketPriorities = [
      { name: "Low", color: "#6b7280", sortOrder: 1 },
      { name: "Medium", color: "#3b82f6", sortOrder: 2 },
      { name: "High", color: "#f59e0b", sortOrder: 3 },
      { name: "Urgent", color: "#ef4444", sortOrder: 4 },
    ];
    for (const p of ticketPriorities) {
      await prisma.ticketPriority.upsert({ where: { name: p.name }, update: {}, create: p });
    }

    // 6. Default client industries
    const clientIndustries = ["Technology","Healthcare","Finance","Retail","Manufacturing","Education","Legal","Hospitality","Non-profit","Other"];
    let order = 1;
    for (const name of clientIndustries) {
      await prisma.clientIndustry.upsert({ where: { name }, update: {}, create: { name, sortOrder: order++ } });
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
