-- AlterTable
ALTER TABLE "AppSetting" ADD COLUMN     "subscriptionsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "clientId" TEXT,
    "provider" TEXT,
    "reference" TEXT,
    "costCents" INTEGER,
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "seats" INTEGER,
    "startDate" TIMESTAMP(3),
    "renewalDate" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "supportLevel" TEXT,
    "warrantyEnd" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SubscriptionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SubscriptionStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_number_key" ON "Subscription"("number");

-- CreateIndex
CREATE INDEX "Subscription_clientId_idx" ON "Subscription"("clientId");

-- CreateIndex
CREATE INDEX "Subscription_statusId_idx" ON "Subscription"("statusId");

-- CreateIndex
CREATE INDEX "Subscription_renewalDate_idx" ON "Subscription"("renewalDate");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "SubscriptionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "SubscriptionStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
