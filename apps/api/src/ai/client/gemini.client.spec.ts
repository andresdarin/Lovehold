import { afterEach, describe, expect, it, vi } from 'vitest'
import { GeminiClient } from './gemini.client'

const options = { systemPrompt: 'prompt', inlineData: { mimeType: 'image/jpeg', data: 'abc' } }
const config = { get: (key: string) => ({ GEMINI_API_KEY: 'secret', GEMINI_API_MODEL: 'gemini-test', GEMINI_TIMEOUT_MS: 20000 } as Record<string, unknown>)[key] }
const success = (text: string) => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }))

describe('GeminiClient', () => {
  afterEach(() => vi.restoreAllMocks())

  it('sends the API key in a header, never in the URL', async () => {
    const request = vi.spyOn(globalThis, 'fetch').mockResolvedValue(success('{}'))
    await new GeminiClient(config as never).generateContent(options)
    expect(request.mock.calls[0]?.[0]).not.toContain('?key=')
    expect(request.mock.calls[0]?.[1]).toMatchObject({ headers: expect.objectContaining({ 'x-goog-api-key': 'secret' }) })
  })

  it('translates timeout aborts', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' }))
    await expect(new GeminiClient(config as never).generateContent(options)).rejects.toThrow('Tiempo de espera')
  })

  it('does not expose the HTTP error body on non-retryable 500 error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('internal error', { status: 500 }))
    await expect(new GeminiClient(config as never).generateContent(options)).rejects.toThrow('Gemini no disponible temporalmente')
  })

  it('returns the first candidate text', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(success('ok'))
    await expect(new GeminiClient(config as never).generateContent(options)).resolves.toBe('ok')
  })

  it('retries on 503 and falls back to secondary model before failing with high demand message', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('overloaded', { status: 503 }))
      .mockResolvedValueOnce(new Response('overloaded', { status: 503 }))
      .mockResolvedValueOnce(new Response('overloaded', { status: 503 }))
      .mockResolvedValueOnce(success('fallback ok'))

    const client = new GeminiClient(config as never)
    // Avoid real delays in test
    vi.spyOn(client as never, 'sleep').mockResolvedValue(undefined as never)

    const result = await client.generateContent(options)
    expect(result).toBe('fallback ok')
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('throws high demand message when all models and retries return 503', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('overloaded', { status: 503 }))
    const client = new GeminiClient(config as never)
    vi.spyOn(client as never, 'sleep').mockResolvedValue(undefined as never)

    await expect(client.generateContent(options)).rejects.toThrow('El modelo de IA tiene mucha demanda en este momento.')
  })
})

