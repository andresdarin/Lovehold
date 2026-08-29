import { describe, expect, it, vi } from 'vitest'
import { WhatsAppClient } from '../whatsapp-client.service'

describe('WhatsAppClient', () => {
  it('no expone el access token en errores ni logs', async () => {
    const token = 'secret-access-token'
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500, text: async () => `failed ${token}` })))
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const client = new WhatsAppClient({ get: vi.fn((key: string) => key === 'WHATSAPP_ACCESS_TOKEN' ? token : undefined) } as any)
    await expect(client.sendText({ to: '59899123456', body: 'Hola', phoneNumberId: '123' })).rejects.toThrow('WhatsApp no disponible')
    expect(errorLog.mock.calls.flat().join(' ')).not.toContain(token)
    errorLog.mockRestore()
    vi.unstubAllGlobals()
  })
})
