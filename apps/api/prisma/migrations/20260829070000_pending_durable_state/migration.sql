-- Make pending actions durable across confirmation retries and process crashes.
ALTER TABLE "AiPendingAction" ADD COLUMN IF NOT EXISTS "attempts" INTEGER NOT NULL DEFAULT 0;
UPDATE "AiPendingAction" SET "status" = 'completed' WHERE "status" = 'confirmed';
ALTER TABLE "AiPendingAction" ALTER COLUMN "status" SET DEFAULT 'pending';
