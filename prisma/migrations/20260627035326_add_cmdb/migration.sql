-- AlterTable
ALTER TABLE "AppSetting" ADD COLUMN     "cmdbEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ConfigItem" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "typeId" TEXT,
    "statusId" TEXT,
    "clientId" TEXT,
    "deviceId" TEXT,
    "environment" TEXT,
    "location" TEXT,
    "owner" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigItemType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#06b6d4',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ConfigItemType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigItemStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ConfigItemStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CIRelations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CIRelations_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfigItem_number_key" ON "ConfigItem"("number");

-- CreateIndex
CREATE INDEX "ConfigItem_clientId_idx" ON "ConfigItem"("clientId");

-- CreateIndex
CREATE INDEX "ConfigItem_typeId_idx" ON "ConfigItem"("typeId");

-- CreateIndex
CREATE UNIQUE INDEX "ConfigItemType_name_key" ON "ConfigItemType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ConfigItemStatus_name_key" ON "ConfigItemStatus"("name");

-- CreateIndex
CREATE INDEX "_CIRelations_B_index" ON "_CIRelations"("B");

-- AddForeignKey
ALTER TABLE "ConfigItem" ADD CONSTRAINT "ConfigItem_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ConfigItemType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigItem" ADD CONSTRAINT "ConfigItem_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ConfigItemStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigItem" ADD CONSTRAINT "ConfigItem_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigItem" ADD CONSTRAINT "ConfigItem_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CIRelations" ADD CONSTRAINT "_CIRelations_A_fkey" FOREIGN KEY ("A") REFERENCES "ConfigItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CIRelations" ADD CONSTRAINT "_CIRelations_B_fkey" FOREIGN KEY ("B") REFERENCES "ConfigItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
