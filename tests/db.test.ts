// @vitest-environment node
import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/db";

describe("connexion base de données", () => {
  it("crée et lit un HealthCheck", async () => {
    const created = await prisma.healthCheck.create({ data: {} });
    const found = await prisma.healthCheck.findUnique({
      where: { id: created.id },
    });
    expect(found?.id).toBe(created.id);
    await prisma.healthCheck.delete({ where: { id: created.id } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
