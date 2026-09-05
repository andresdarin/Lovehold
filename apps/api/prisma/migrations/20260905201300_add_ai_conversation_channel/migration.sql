-- AlterTable: AiConversation.channel was added to schema.prisma without a migration (P2022 ColumnNotFound).
-- Backfill-safe: nullable with default 'web'.
ALTER TABLE "AiConversation" ADD COLUMN IF NOT EXISTS "channel" TEXT DEFAULT 'web';
