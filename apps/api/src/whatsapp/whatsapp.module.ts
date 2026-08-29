import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { WhatsAppClient } from './whatsapp-client.service'

@Module({
  imports: [ConfigModule],
  providers: [WhatsAppClient],
  exports: [WhatsAppClient],
})
export class WhatsAppModule {}
