import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

interface SendTextOptions {
  to: string
  body: string
  phoneNumberId: string
}

@Injectable()
export class WhatsAppClient {
  constructor(private readonly config: ConfigService) {}

  async sendText({ to, body, phoneNumberId }: SendTextOptions): Promise<void> {
    const token = this.config.get<string>('WHATSAPP_ACCESS_TOKEN') ?? ''
    const apiVersion = this.config.get<string>('WHATSAPP_API_VERSION') || 'v19.0'
    const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: body.slice(0, 4096), preview_url: false },
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const responseBody = await response.text().catch(() => '')
        const preview = token ? responseBody.slice(0, 100).replaceAll(token, '[REDACTED]') : responseBody.slice(0, 100)
        console.error({ status: response.status, phoneNumberId, preview })
        throw new ServiceUnavailableException('WhatsApp no disponible temporalmente')
      }

      console.log({ msg: 'WhatsApp outbound', to: to.slice(-4), phoneNumberId })
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error
      if ((error as { name?: string }).name === 'AbortError') {
        throw new ServiceUnavailableException('Tiempo de espera agotado al contactar WhatsApp')
      }
      throw new ServiceUnavailableException('WhatsApp no disponible temporalmente')
    } finally {
      clearTimeout(timeout)
    }
  }
}
