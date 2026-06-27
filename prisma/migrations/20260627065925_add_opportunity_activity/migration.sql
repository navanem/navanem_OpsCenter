-- CreateTable
CREATE TABLE "OpportunityActivity" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "authorId" TEXT,
    "type" TEXT NOT NULL,
    "body" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpportunityActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OpportunityActivity_opportunityId_idx" ON "OpportunityActivity"("opportunityId");

-- AddForeignKey
ALTER TABLE "OpportunityActivity" ADD CONSTRAINT "OpportunityActivity_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityActivity" ADD CONSTRAINT "OpportunityActivity_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
