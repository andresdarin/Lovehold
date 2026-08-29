import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AiModule } from '../ai/ai.module'
import { WhatsAppInboundService } from './whatsapp/whatsapp-inbound.service'
import { WhatsAppWebhookController } from './whatsapp/whatsapp-webhook.controller'
import { WhatsAppWebhookService } from './whatsapp/whatsapp-webhook.service'
import { WhatsAppModule } from '../whatsapp/whatsapp.module'

@Module({
  imports: [ConfigModule, AiModule, WhatsAppModule],
  controllers: [WhatsAppWebhookController],
  providers: [WhatsAppWebhookService, WhatsAppInboundService],
})
export class WebhooksModule {}
