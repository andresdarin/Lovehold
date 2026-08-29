import { Injectable } from '@nestjs/common'

export interface NormalizedWhatsAppMessage {
  wamid: string
  from: string
  phoneNumberId: string
  timestamp?: string
  type: string
  text: string
}

type MetaPayload = {
  object?: unknown
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<Record<string, unknown>>
        metadata?: { phone_number_id?: unknown }
      }
    }>
  }>
}

@Injectable()
export class WhatsAppWebhookService {
  parseMetaPayload(payload: unknown): NormalizedWhatsAppMessage | null {
    if (!payload || typeof payload !== 'object') return null

    const meta = payload as MetaPayload
    const value = meta.entry?.[0]?.changes?.[0]?.value
    const message = value?.messages?.[0]
    const metadata = value?.metadata
    const text = message?.text

    if (
      meta.object !== 'whatsapp_business_account' ||
      !message ||
      message.type !== 'text' ||
      !metadata ||
      typeof metadata.phone_number_id !== 'string' ||
      typeof message.id !== 'string' ||
      typeof message.from !== 'string' ||
      !text ||
      typeof text !== 'object' ||
      typeof (text as { body?: unknown }).body !== 'string'
    ) {
      return null
    }

    return {
      wamid: message.id,
      from: message.from,
      phoneNumberId: metadata.phone_number_id,
      timestamp: typeof message.timestamp === 'string' ? message.timestamp : undefined,
      type: 'text',
      text: (text as { body: string }).body,
    }
  }
}
