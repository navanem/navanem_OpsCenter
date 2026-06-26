-- AlterTable
ALTER TABLE "AppSetting" ADD COLUMN     "defaultLocale" TEXT NOT NULL DEFAULT 'en';

-- AlterTable
ALTER TABLE "ClientContact" ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'en';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'en';
