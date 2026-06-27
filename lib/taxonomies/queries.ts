import { prisma } from "@/lib/db";

const order = [{ sortOrder: "asc" as const }, { name: "asc" as const }];

export function listTicketCategories(opts?: { activeOnly?: boolean }) {
  return prisma.ticketCategory.findMany({
    where: opts?.activeOnly ? { isActive: true } : undefined,
    orderBy: order,
  });
}

export function listTicketPriorities(opts?: { activeOnly?: boolean }) {
  return prisma.ticketPriority.findMany({
    where: opts?.activeOnly ? { isActive: true } : undefined,
    orderBy: order,
  });
}

export function listClientIndustries(opts?: { activeOnly?: boolean }) {
  return prisma.clientIndustry.findMany({
    where: opts?.activeOnly ? { isActive: true } : undefined,
    orderBy: order,
  });
}

export function getTicketCategory(id: string) {
  return prisma.ticketCategory.findUnique({ where: { id } });
}

export function getTicketPriority(id: string) {
  return prisma.ticketPriority.findUnique({ where: { id } });
}

export function getClientIndustry(id: string) {
  return prisma.clientIndustry.findUnique({ where: { id } });
}

export function listProjectStatuses(opts?: { activeOnly?: boolean }) {
  return prisma.projectStatus.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function listProjectTaskStatuses(opts?: { activeOnly?: boolean }) {
  return prisma.projectTaskStatus.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function getProjectStatus(id: string) {
  return prisma.projectStatus.findUnique({ where: { id } });
}

export function getProjectTaskStatus(id: string) {
  return prisma.projectTaskStatus.findUnique({ where: { id } });
}

export function listVisitTypes(opts?: { activeOnly?: boolean }) {
  return prisma.visitType.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function getVisitType(id: string) {
  return prisma.visitType.findUnique({ where: { id } });
}

export function listContractTypes(opts?: { activeOnly?: boolean }) {
  return prisma.contractType.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function getContractType(id: string) {
  return prisma.contractType.findUnique({ where: { id } });
}

export function listContractStatuses(opts?: { activeOnly?: boolean }) {
  return prisma.contractStatus.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function getContractStatus(id: string) {
  return prisma.contractStatus.findUnique({ where: { id } });
}

export function listTicketTags(opts?: { activeOnly?: boolean }) {
  return prisma.ticketTag.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function getTicketTag(id: string) {
  return prisma.ticketTag.findUnique({ where: { id } });
}

export function listKnowledgeCategories(opts?: { activeOnly?: boolean }) {
  return prisma.knowledgeCategory.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function getKnowledgeCategory(id: string) {
  return prisma.knowledgeCategory.findUnique({ where: { id } });
}

export function listDeviceTypes(opts?: { activeOnly?: boolean }) {
  return prisma.deviceType.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function listDeviceStatuses(opts?: { activeOnly?: boolean }) {
  return prisma.deviceStatus.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function listSubscriptionTypes(opts?: { activeOnly?: boolean }) {
  return prisma.subscriptionType.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function listSubscriptionStatuses(opts?: { activeOnly?: boolean }) {
  return prisma.subscriptionStatus.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function listTicketTypes(opts?: { activeOnly?: boolean }) {
  return prisma.ticketType.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function listChangeTypes(opts?: { activeOnly?: boolean }) {
  return prisma.changeType.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function listChangeStatuses(opts?: { activeOnly?: boolean }) {
  return prisma.changeStatus.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function listConfigItemTypes(opts?: { activeOnly?: boolean }) {
  return prisma.configItemType.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function listConfigItemStatuses(opts?: { activeOnly?: boolean }) {
  return prisma.configItemStatus.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function listLeadSources(opts?: { activeOnly?: boolean }) {
  return prisma.leadSource.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function listLeadStatuses(opts?: { activeOnly?: boolean }) {
  return prisma.leadStatus.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function listOpportunityStages(opts?: { activeOnly?: boolean }) {
  return prisma.opportunityStage.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function listProblemTypes(opts?: { activeOnly?: boolean }) {
  return prisma.problemType.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function listProblemStatuses(opts?: { activeOnly?: boolean }) {
  return prisma.problemStatus.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function listReleaseTypes(opts?: { activeOnly?: boolean }) {
  return prisma.releaseType.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}

export function listReleaseStatuses(opts?: { activeOnly?: boolean }) {
  return prisma.releaseStatus.findMany({ where: opts?.activeOnly ? { isActive: true } : undefined, orderBy: order });
}
