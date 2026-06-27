-- AlterTable
ALTER TABLE "AppSetting" ADD COLUMN     "problemsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "releasesEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "typeId" TEXT,
    "statusId" TEXT NOT NULL,
    "clientId" TEXT,
    "assigneeId" TEXT,
    "priority" TEXT,
    "impact" TEXT,
    "rootCause" TEXT,
    "workaround" TEXT,
    "resolution" TEXT,
    "knownError" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#ef4444',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProblemType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProblemStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Release" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT,
    "description" TEXT,
    "typeId" TEXT,
    "statusId" TEXT NOT NULL,
    "clientId" TEXT,
    "ownerId" TEXT,
    "plannedDate" TIMESTAMP(3),
    "releasedDate" TIMESTAMP(3),
    "releaseNotes" TEXT,
    "rollbackPlan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ReleaseType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ReleaseStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Problem_number_key" ON "Problem"("number");

-- CreateIndex
CREATE INDEX "Problem_clientId_idx" ON "Problem"("clientId");

-- CreateIndex
CREATE INDEX "Problem_statusId_idx" ON "Problem"("statusId");

-- CreateIndex
CREATE UNIQUE INDEX "ProblemType_name_key" ON "ProblemType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProblemStatus_name_key" ON "ProblemStatus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Release_number_key" ON "Release"("number");

-- CreateIndex
CREATE INDEX "Release_clientId_idx" ON "Release"("clientId");

-- CreateIndex
CREATE INDEX "Release_statusId_idx" ON "Release"("statusId");

-- CreateIndex
CREATE UNIQUE INDEX "ReleaseType_name_key" ON "ReleaseType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ReleaseStatus_name_key" ON "ReleaseStatus"("name");

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ProblemType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ProblemStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ReleaseType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ReleaseStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
