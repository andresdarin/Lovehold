import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { AiConfig } from '../config/ai.config'
import type { GeminiGenerateContentResponse, ModelConfig } from './gemini.types'

@Injectable()
export class GeminiClient {
  constructor(private readonly configService: ConfigService) {}

  async generateContent(opts: {
    model?: string
    systemPrompt: string
    inlineData: { mimeType: string; data: string }
    generationConfig?: ModelConfig
    signal?: AbortSignal
  }): Promise<string> {
    const config = this.getConfig()
    if (!config.GEMINI_API_KEY) {
      throw new ServiceUnavailableException('Gemini no disponible temporalmente')
    }

    const controller = opts.signal ? undefined : new AbortController()
    const timeout = controller ? setTimeout(() => controller.abort(), config.GEMINI_TIMEOUT_MS) : undefined
    try {
      const model = opts.model || config.GEMINI_API_MODEL
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.GEMINI_API_KEY },
          signal: opts.signal || controller?.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: opts.systemPrompt }, { inlineData: opts.inlineData }] }],
            generationConfig: opts.generationConfig,
          }),
        },
      )
      if (!response.ok) {
        const body = await response.text().catch(() => 'Unknown error')
        console.error(`[GeminiClient] Gemini request failed (${response.status}): ${body.slice(0, 1000)}`)
        throw new ServiceUnavailableException('Gemini no disponible temporalmente')
      }

      const result = (await response.json()) as GeminiGenerateContentResponse
      const finishReason = result.candidates?.[0]?.finishReason
      if (finishReason && finishReason !== 'STOP') console.error(`[GeminiClient] finishReason: ${finishReason}`)
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) throw new BadRequestException('Gemini no devolvió contenido en la respuesta.')
      return text
    } catch (error) {
      if (error instanceof ServiceUnavailableException || error instanceof BadRequestException) throw error
      if (controller && (error as { name?: string })?.name === 'AbortError') {
        throw new ServiceUnavailableException('Tiempo de espera agotado al contactar Gemini')
      }
      console.error('[GeminiClient] Gemini request failed unexpectedly')
      throw new ServiceUnavailableException('Gemini no disponible temporalmente')
    } finally {
      if (timeout) clearTimeout(timeout)
    }
  }

  private getConfig(): AiConfig {
    return {
      GEMINI_API_KEY: this.configService.get<string>('GEMINI_API_KEY'),
      GEMINI_API_MODEL: this.configService.get<string>('GEMINI_API_MODEL') || 'gemini-2.5-flash',
      GEMINI_TEMPERATURE: Number(this.configService.get('GEMINI_TEMPERATURE') ?? 0.1),
      GEMINI_MAX_OUTPUT_TOKENS: Number(this.configService.get('GEMINI_MAX_OUTPUT_TOKENS') ?? 2048),
      GEMINI_TIMEOUT_MS: Number(this.configService.get('GEMINI_TIMEOUT_MS') ?? 20000),
    }
  }
}
