import { Body, Controller, Get, Logger, Post, Query, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { WhatsAppInboundService } from './whatsapp-inbound.service'
import { WhatsAppWebhookService } from './whatsapp-webhook.service'

type WebhookResponse = {
  type(contentType: string): WebhookResponse
  status(code: number): WebhookResponse
  send(body?: unknown): unknown
}

@Controller('webhooks/whatsapp')
export class WhatsAppWebhookController {
  private readonly logger = new Logger(WhatsAppWebhookController.name)

  constructor(
    private readonly config: ConfigService,
    private readonly webhookService: WhatsAppWebhookService,
    private readonly inboundService: WhatsAppInboundService,
  ) {}

  @Get()
  verify(@Query() query: Record<string, string>, @Res() response: WebhookResponse) {
    const mode = query['hub.mode']
    this.logger.log({ event: 'whatsapp_webhook_verification', mode: mode ?? null })

    if (
      mode === 'subscribe' &&
      query['hub.verify_token'] === this.config.get<string>('META_WEBHOOK_VERIFY_TOKEN')
    ) {
      return response.type('text/plain').send(query['hub.challenge'] ?? '')
    }

    return response.status(403).send()
  }

  @Post()
  receive(@Body() payload: unknown, @Res() response: WebhookResponse) {
    // Meta requires a quick acknowledgement; processing continues asynchronously.
    response.status(200).send({ status: 'ok' })
    void Promise.resolve().then(() => this.processPayload(payload))
  }

  private async processPayload(payload: unknown): Promise<void> {
    const message = this.webhookService.parseMetaPayload(payload)
    if (!message) {
      this.logger.debug({ event: 'whatsapp_webhook_ignored', reason: 'unsupported_or_invalid_message' })
      return
    }

    await this.inboundService.process(message)
  }
}
