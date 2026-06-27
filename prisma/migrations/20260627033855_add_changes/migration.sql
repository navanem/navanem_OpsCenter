-- AlterTable
ALTER TABLE "AppSetting" ADD COLUMN     "changesEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Change" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "typeId" TEXT,
    "statusId" TEXT NOT NULL,
    "clientId" TEXT,
    "assigneeId" TEXT,
    "risk" TEXT,
    "impact" TEXT,
    "plannedStart" TIMESTAMP(3),
    "plannedEnd" TIMESTAMP(3),
    "implementationPlan" TEXT,
    "rollbackPlan" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Change_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#8b5cf6',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ChangeType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ChangeStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Change_number_key" ON "Change"("number");

-- CreateIndex
CREATE INDEX "Change_clientId_idx" ON "Change"("clientId");

-- CreateIndex
CREATE INDEX "Change_statusId_idx" ON "Change"("statusId");

-- CreateIndex
CREATE UNIQUE INDEX "ChangeType_name_key" ON "ChangeType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ChangeStatus_name_key" ON "ChangeStatus"("name");

-- AddForeignKey
ALTER TABLE "Change" ADD CONSTRAINT "Change_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ChangeType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Change" ADD CONSTRAINT "Change_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ChangeStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Change" ADD CONSTRAINT "Change_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Change" ADD CONSTRAINT "Change_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Change" ADD CONSTRAINT "Change_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
