-- Add snapshot_date with a temporary default so existing rows are valid
ALTER TABLE "net_worth_snapshots" ADD COLUMN "snapshot_date" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- Backfill existing rows from created_at
UPDATE "net_worth_snapshots" SET "snapshot_date" = "created_at";

-- Remove the temporary default; application always supplies the value going forward
ALTER TABLE "net_worth_snapshots" ALTER COLUMN "snapshot_date" DROP DEFAULT;
