-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "created_by_id" TEXT;

-- CreateTable
CREATE TABLE "report_shares" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "report_shares_report_id_user_id_key" ON "report_shares"("report_id", "user_id");

-- AddForeignKey
ALTER TABLE "report_shares" ADD CONSTRAINT "report_shares_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_shares" ADD CONSTRAINT "report_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("supabase_id") ON DELETE CASCADE ON UPDATE CASCADE;
