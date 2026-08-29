-- Recover executing pending actions after a process crash using a durable lease.
ALTER TABLE "AiPendingAction" ADD COLUMN IF NOT EXISTS "executionLeaseUntil" TIMESTAMP(3);
ALTER TABLE "AiPendingAction" ADD COLUMN IF NOT EXISTS "executionStartedAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "AiPendingAction_executionLeaseUntil_idx" ON "AiPendingAction"("executionLeaseUntil");
