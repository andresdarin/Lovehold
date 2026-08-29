import { describe, expect, it, vi } from 'vitest'
import { ConfigService } from '@nestjs/config'
import { WhatsAppWebhookController } from '../whatsapp-webhook.controller'
import { WhatsAppWebhookService } from '../whatsapp-webhook.service'

const payload = (type = 'text') => ({
  object: 'whatsapp_business_account', entry: [{ changes: [{ value: {
    metadata: { phone_number_id: '123' }, contacts: [{ wa_id: '59899123456' }],
    messages: [{ id: 'wamid.xxx', from: '59899123456', timestamp: '1700000000', type,
      ...(type === 'text' ? { text: { body: 'Hola' } } : { image: { id: 'image-1' } }) }],
  } }] }],
})

const response = () => ({ type: vi.fn().mockReturnThis(), status: vi.fn().mockReturnThis(), send: vi.fn() })

describe('WhatsApp webhook', () => {
  it('devuelve el challenge para una verificación correcta', () => {
    const res = response()
    const controller = new WhatsAppWebhookController(
      { get: vi.fn(() => 'valid-token') } as unknown as ConfigService,
      {} as any, {} as any,
    )
    controller.verify({ 'hub.mode': 'subscribe', 'hub.verify_token': 'valid-token', 'hub.challenge': 'challenge-1' }, res)
    expect(res.type).toHaveBeenCalledWith('text/plain')
    expect(res.send).toHaveBeenCalledWith('challenge-1')
  })

  it('rechaza un token incorrecto con 403', () => {
    const res = response()
    const controller = new WhatsAppWebhookController(
      { get: vi.fn(() => 'valid-token') } as unknown as ConfigService,
      {} as any, {} as any,
    )
    controller.verify({ 'hub.mode': 'subscribe', 'hub.verify_token': 'wrong' }, res)
    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('extrae el payload Meta válido', () => {
    expect(new WhatsAppWebhookService().parseMetaPayload(payload())).toMatchObject({
      wamid: 'wamid.xxx', from: '59899123456', phoneNumberId: '123', text: 'Hola',
    })
  })

  it('ignora mensajes image/audio sin ejecutar procesamiento', async () => {
    const inbound = { process: vi.fn() }
    const controller = new WhatsAppWebhookController(
      { get: vi.fn() } as any, new WhatsAppWebhookService(), inbound as any,
    )
    const res = response()
    controller.receive(payload('image'), res)
    await Promise.resolve()
    await Promise.resolve()
    expect(inbound.process).not.toHaveBeenCalled()
  })
})
