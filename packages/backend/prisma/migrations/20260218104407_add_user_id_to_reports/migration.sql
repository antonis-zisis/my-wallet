-- Clear existing dev data (reports and cascaded transactions) before adding non-nullable user_id
TRUNCATE TABLE "reports" CASCADE;

-- AlterTable
ALTER TABLE "reports" ADD COLUMN "user_id" TEXT NOT NULL;
