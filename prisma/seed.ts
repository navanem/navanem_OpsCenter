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

    // 2b. Starter roles (editable; not system-locked). Created once, then left alone.
    const byKey = (keys: string[]) =>
      allPermissions.filter((p) => keys.includes(p.key)).map((p) => ({ id: p.id }));

    const technicianKeys = [
      "clients.read",
      "tickets.read", "tickets.manage", "tickets.assign",
      "projects.read", "projects.manage", "projects.assign",
      "visits.read", "visits.manage", "visits.assign",
      "timesheets.read",
      "contracts.read",
      "knowledge.read", "knowledge.manage",
      "devices.read", "devices.manage",
      "subscriptions.read",
    ];
    const managerKeys = [
      ...technicianKeys,
      "clients.manage", "clients.assign",
      "users.read", "users.manage",
      "roles.read",
      "timesheets.read.all", "timesheets.approve",
      "contracts.manage",
      "subscriptions.manage",
    ];

    for (const role of [
      { name: "Manager", description: "Runs operations and the team — no system configuration", keys: managerKeys },
      { name: "Technician", description: "Day-to-day operations — no access to settings", keys: technicianKeys },
    ]) {
      const existingRole = await prisma.role.findUnique({ where: { name: role.name } });
      if (!existingRole) {
        await prisma.role.create({
          data: {
            name: role.name,
            description: role.description,
            isSystem: false,
            permissions: { connect: byKey(role.keys) },
          },
        });
        console.log(`Created role: ${role.name}`);
      } else {
        console.log(`Role already exists: ${role.name}`);
      }
    }

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

    // 7. Default project statuses
    const projectStatuses = [
      { name: "Planning", color: "#6b7280", sortOrder: 1 },
      { name: "Active", color: "#3b82f6", sortOrder: 2 },
      { name: "On hold", color: "#f59e0b", sortOrder: 3 },
      { name: "Completed", color: "#10b981", sortOrder: 4 },
      { name: "Cancelled", color: "#ef4444", sortOrder: 5 },
    ];
    for (const s of projectStatuses) {
      await prisma.projectStatus.upsert({ where: { name: s.name }, update: {}, create: s });
    }

    // 8. Default project task statuses
    const taskStatuses = [
      { name: "To do", color: "#6b7280", sortOrder: 1 },
      { name: "In progress", color: "#3b82f6", sortOrder: 2 },
      { name: "Blocked", color: "#ef4444", sortOrder: 3 },
      { name: "Done", color: "#10b981", sortOrder: 4 },
    ];
    for (const s of taskStatuses) {
      await prisma.projectTaskStatus.upsert({ where: { name: s.name }, update: {}, create: s });
    }

    // 9. Default visit types
    const visitTypes = [
      { name: "Client support", color: "#3b82f6", sortOrder: 1 },
      { name: "Office support", color: "#8b5cf6", sortOrder: 2 },
      { name: "Maintenance", color: "#10b981", sortOrder: 3 },
      { name: "Other", color: "#6b7280", sortOrder: 4 },
    ];
    for (const t of visitTypes) {
      await prisma.visitType.upsert({ where: { name: t.name }, update: {}, create: t });
    }

    // 10. Default contract types (with default hourly rates, in cents)
    const contractTypes = [
      { name: "Support", color: "#3b82f6", sortOrder: 1, defaultHourlyRateCents: 12000 },
      { name: "Maintenance", color: "#10b981", sortOrder: 2, defaultHourlyRateCents: 11000 },
      { name: "Infogérance", color: "#8b5cf6", sortOrder: 3, defaultHourlyRateCents: 14000 },
      { name: "Project", color: "#f59e0b", sortOrder: 4, defaultHourlyRateCents: 15000 },
      { name: "Other", color: "#6b7280", sortOrder: 5, defaultHourlyRateCents: null },
    ];
    for (const t of contractTypes) {
      await prisma.contractType.upsert({ where: { name: t.name }, update: {}, create: t });
    }

    // 11. Default contract statuses
    const contractStatuses = [
      { name: "Draft", color: "#6b7280", sortOrder: 1 },
      { name: "Active", color: "#10b981", sortOrder: 2 },
      { name: "Expired", color: "#f59e0b", sortOrder: 3 },
      { name: "Cancelled", color: "#ef4444", sortOrder: 4 },
    ];
    for (const s of contractStatuses) {
      await prisma.contractStatus.upsert({ where: { name: s.name }, update: {}, create: s });
    }

    // 12. Default ticket tags
    const ticketTags = [
      { name: "Bug", color: "#ef4444", sortOrder: 1 },
      { name: "Feature request", color: "#8b5cf6", sortOrder: 2 },
      { name: "Question", color: "#3b82f6", sortOrder: 3 },
      { name: "Follow-up", color: "#f59e0b", sortOrder: 4 },
      { name: "Billing", color: "#10b981", sortOrder: 5 },
    ];
    for (const t of ticketTags) {
      await prisma.ticketTag.upsert({ where: { name: t.name }, update: {}, create: t });
    }

    // 13. Default knowledge base categories
    const knowledgeCategories = [
      { name: "How-to", color: "#3b82f6", sortOrder: 1 },
      { name: "Troubleshooting", color: "#ef4444", sortOrder: 2 },
      { name: "Tips & tricks", color: "#8b5cf6", sortOrder: 3 },
      { name: "Policies", color: "#f59e0b", sortOrder: 4 },
      { name: "Onboarding", color: "#10b981", sortOrder: 5 },
    ];
    for (const c of knowledgeCategories) {
      await prisma.knowledgeCategory.upsert({ where: { name: c.name }, update: {}, create: c });
    }

    // 14. Default device types
    const deviceTypes = [
      { name: "Laptop", color: "#3b82f6", sortOrder: 1 },
      { name: "Desktop", color: "#6366f1", sortOrder: 2 },
      { name: "Server", color: "#8b5cf6", sortOrder: 3 },
      { name: "Network device", color: "#06b6d4", sortOrder: 4 },
      { name: "Printer", color: "#f59e0b", sortOrder: 5 },
      { name: "Mobile", color: "#10b981", sortOrder: 6 },
      { name: "Other", color: "#6b7280", sortOrder: 7 },
    ];
    for (const t of deviceTypes) {
      await prisma.deviceType.upsert({ where: { name: t.name }, update: {}, create: t });
    }

    // 15. Default device statuses
    const deviceStatuses = [
      { name: "Active", color: "#10b981", sortOrder: 1 },
      { name: "Spare", color: "#3b82f6", sortOrder: 2 },
      { name: "In repair", color: "#f59e0b", sortOrder: 3 },
      { name: "Retired", color: "#6b7280", sortOrder: 4 },
    ];
    for (const s of deviceStatuses) {
      await prisma.deviceStatus.upsert({ where: { name: s.name }, update: {}, create: s });
    }

    // 16. Default subscription types & statuses (name not unique → findFirst guard)
    const subscriptionTypes = [
      { name: "Software / SaaS", color: "#6366f1", sortOrder: 1 },
      { name: "Microsoft 365", color: "#3b82f6", sortOrder: 2 },
      { name: "Hosting", color: "#06b6d4", sortOrder: 3 },
      { name: "Domain", color: "#8b5cf6", sortOrder: 4 },
      { name: "Support plan", color: "#10b981", sortOrder: 5 },
      { name: "Warranty", color: "#f59e0b", sortOrder: 6 },
      { name: "Other", color: "#6b7280", sortOrder: 7 },
    ];
    for (const t of subscriptionTypes) {
      if (!(await prisma.subscriptionType.findFirst({ where: { name: t.name } }))) {
        await prisma.subscriptionType.create({ data: t });
      }
    }
    const subscriptionStatuses = [
      { name: "Active", color: "#10b981", sortOrder: 1 },
      { name: "Pending renewal", color: "#f59e0b", sortOrder: 2 },
      { name: "Cancelled", color: "#6b7280", sortOrder: 3 },
      { name: "Expired", color: "#ef4444", sortOrder: 4 },
    ];
    for (const s of subscriptionStatuses) {
      if (!(await prisma.subscriptionStatus.findFirst({ where: { name: s.name } }))) {
        await prisma.subscriptionStatus.create({ data: s });
      }
    }

    // 17. Default ticket types (ITSM: incident vs service request)
    const ticketTypes = [
      { name: "Incident", color: "#ef4444", sortOrder: 1 },
      { name: "Service request", color: "#3b82f6", sortOrder: 2 },
      { name: "Change", color: "#8b5cf6", sortOrder: 3 },
    ];
    for (const t of ticketTypes) {
      await prisma.ticketType.upsert({ where: { name: t.name }, update: {}, create: t });
    }

    // 18. Default change types & statuses (ITSM change management)
    const changeTypes = [
      { name: "Standard", color: "#10b981", sortOrder: 1 },
      { name: "Normal", color: "#3b82f6", sortOrder: 2 },
      { name: "Emergency", color: "#ef4444", sortOrder: 3 },
    ];
    for (const t of changeTypes) {
      await prisma.changeType.upsert({ where: { name: t.name }, update: {}, create: t });
    }
    const changeStatuses = [
      { name: "Draft", color: "#6b7280", sortOrder: 1 },
      { name: "Pending approval", color: "#f59e0b", sortOrder: 2 },
      { name: "Approved", color: "#3b82f6", sortOrder: 3 },
      { name: "Scheduled", color: "#8b5cf6", sortOrder: 4 },
      { name: "In progress", color: "#06b6d4", sortOrder: 5 },
      { name: "Completed", color: "#10b981", sortOrder: 6 },
      { name: "Rejected", color: "#ef4444", sortOrder: 7 },
      { name: "Cancelled", color: "#6b7280", sortOrder: 8 },
    ];
    for (const s of changeStatuses) {
      await prisma.changeStatus.upsert({ where: { name: s.name }, update: {}, create: s });
    }

    // 19. Default CMDB configuration-item types & statuses
    const ciTypes = [
      { name: "Server", color: "#6366f1", sortOrder: 1 },
      { name: "Application", color: "#3b82f6", sortOrder: 2 },
      { name: "Service", color: "#06b6d4", sortOrder: 3 },
      { name: "Database", color: "#8b5cf6", sortOrder: 4 },
      { name: "Network device", color: "#f59e0b", sortOrder: 5 },
      { name: "Workstation", color: "#10b981", sortOrder: 6 },
      { name: "Cloud resource", color: "#ec4899", sortOrder: 7 },
    ];
    for (const t of ciTypes) {
      await prisma.configItemType.upsert({ where: { name: t.name }, update: {}, create: t });
    }
    const ciStatuses = [
      { name: "Operational", color: "#10b981", sortOrder: 1 },
      { name: "Degraded", color: "#f59e0b", sortOrder: 2 },
      { name: "Maintenance", color: "#3b82f6", sortOrder: 3 },
      { name: "Retired", color: "#6b7280", sortOrder: 4 },
    ];
    for (const s of ciStatuses) {
      await prisma.configItemStatus.upsert({ where: { name: s.name }, update: {}, create: s });
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
