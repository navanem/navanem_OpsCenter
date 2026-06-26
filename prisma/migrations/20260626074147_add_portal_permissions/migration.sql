-- AlterTable
ALTER TABLE "ClientContact" ADD COLUMN     "portalCanComment" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "portalCanCreate" BOOLEAN NOT NULL DEFAULT true;
