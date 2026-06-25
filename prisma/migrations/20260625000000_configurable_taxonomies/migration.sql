-- Stash the existing enum values as text on new nullable columns
ALTER TABLE "Ticket" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "Ticket" ADD COLUMN "priorityId" TEXT;
UPDATE "Ticket" SET "categoryId" = "category"::text, "priorityId" = "priority"::text;

-- Drop the old enum columns and types (frees the names for the new tables)
ALTER TABLE "Ticket" DROP COLUMN "category";
ALTER TABLE "Ticket" DROP COLUMN "priority";
DROP TYPE "TicketCategory";
DROP TYPE "TicketPriority";

-- Create the lookup tables
CREATE TABLE "TicketCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TicketCategory_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "TicketPriority" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TicketPriority_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ClientIndustry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ClientIndustry_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TicketCategory_name_key" ON "TicketCategory"("name");
CREATE UNIQUE INDEX "TicketPriority_name_key" ON "TicketPriority"("name");
CREATE UNIQUE INDEX "ClientIndustry_name_key" ON "ClientIndustry"("name");

-- Seed the default taxonomies
INSERT INTO "TicketCategory" ("id","name","color","sortOrder","isActive","createdAt","updatedAt") VALUES
  ('tcat_hardware','Hardware','#3b82f6',1,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('tcat_software','Software','#8b5cf6',2,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('tcat_network','Network','#06b6d4',3,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('tcat_account','Account','#f59e0b',4,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('tcat_other','Other','#6b7280',5,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "TicketPriority" ("id","name","color","sortOrder","isActive","createdAt","updatedAt") VALUES
  ('tpri_low','Low','#6b7280',1,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('tpri_medium','Medium','#3b82f6',2,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('tpri_high','High','#f59e0b',3,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('tpri_urgent','Urgent','#ef4444',4,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
INSERT INTO "ClientIndustry" ("id","name","sortOrder","isActive","createdAt","updatedAt") VALUES
  ('cind_technology','Technology',1,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('cind_healthcare','Healthcare',2,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('cind_finance','Finance',3,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('cind_retail','Retail',4,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('cind_manufacturing','Manufacturing',5,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('cind_education','Education',6,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('cind_legal','Legal',7,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('cind_hospitality','Hospitality',8,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('cind_nonprofit','Non-profit',9,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
  ('cind_other','Other',10,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);

-- Re-map the stashed enum text (e.g. 'HARDWARE') to the new FK ids
UPDATE "Ticket" t SET "categoryId" = c."id" FROM "TicketCategory" c WHERE upper(c."name") = t."categoryId";
UPDATE "Ticket" t SET "priorityId" = p."id" FROM "TicketPriority" p WHERE upper(p."name") = t."priorityId";
-- Safety net for any unmatched value
UPDATE "Ticket" SET "categoryId" = 'tcat_other' WHERE "categoryId" IS NULL OR "categoryId" NOT IN (SELECT "id" FROM "TicketCategory");
UPDATE "Ticket" SET "priorityId" = 'tpri_medium' WHERE "priorityId" IS NULL OR "priorityId" NOT IN (SELECT "id" FROM "TicketPriority");

-- Enforce NOT NULL now that every row has a value
ALTER TABLE "Ticket" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "Ticket" ALTER COLUMN "priorityId" SET NOT NULL;

-- Client industry column (optional)
ALTER TABLE "Client" ADD COLUMN "industryId" TEXT;

-- Foreign keys
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TicketCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES "TicketPriority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Client" ADD CONSTRAINT "Client_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "ClientIndustry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
