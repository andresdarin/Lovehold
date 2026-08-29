-- DropTable if partially created
DROP TABLE IF EXISTS "WhatsAppInboundMessage" CASCADE;

-- CreateTable
CREATE TABLE "WhatsAppInboundMessage" (
    "id" TEXT NOT NULL,
    "wamid" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "phoneNumberId" TEXT,
    "profileId" TEXT,
    "conversationId" TEXT,
    "type" TEXT NOT NULL,
    "body" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'received',
    "processingStartedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppInboundMessage_pkey" PRIMARY KEY ("id")
);

-- AlterTable Profile
ALTER TABLE "Profile" ADD COLUMN IF NOT EXISTS "whatsappPhone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WhatsAppInboundMessage_wamid_key" ON "WhatsAppInboundMessage"("wamid");
CREATE UNIQUE INDEX IF NOT EXISTS "Profile_whatsappPhone_key" ON "Profile"("whatsappPhone");
CREATE INDEX IF NOT EXISTS "WhatsAppInboundMessage_from_createdAt_idx" ON "WhatsAppInboundMessage"("from", "createdAt");
CREATE INDEX IF NOT EXISTS "WhatsAppInboundMessage_status_idx" ON "WhatsAppInboundMessage"("status");
CREATE INDEX IF NOT EXISTS "WhatsAppInboundMessage_phoneNumberId_idx" ON "WhatsAppInboundMessage"("phoneNumberId");

-- AddForeignKey
ALTER TABLE "WhatsAppInboundMessage" ADD CONSTRAINT "WhatsAppInboundMessage_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WhatsAppInboundMessage" ADD CONSTRAINT "WhatsAppInboundMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
