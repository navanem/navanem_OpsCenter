import "server-only";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";

export type OpportunityActivityType = "NOTE" | "CREATED" | "STAGE_CHANGED" | "OUTCOME_CHANGED" | "UPDATED";

// Records an opportunity timeline entry. Best-effort: failures are swallowed so
// they can never break the action that triggered them.
export async function recordOpportunityActivity(
  opportunityId: string,
  type: OpportunityActivityType,
  body?: string | null,
): Promise<void> {
  try {
    const user = await getCurrentUser();
    await prisma.opportunityActivity.create({
      data: {
        opportunityId,
        authorId: user?.id ?? null,
        type,
        body: body && body.length > 0 ? body : null,
      },
    });
  } catch {
    /* never let timeline logging break the underlying action */
  }
}

export function listOpportunityActivities(opportunityId: string) {
  return prisma.opportunityActivity.findMany({
    where: { opportunityId },
    include: { author: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
  });
}
