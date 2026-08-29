import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { AiConfig } from '../config/ai.config'
import type { ChatGenerateResponse, ChatMessage, FunctionCall, FunctionDeclaration, GeminiGenerateContentResponse, ModelConfig } from './gemini.types'

export interface GeminiContentPart {
  text?: string
  inlineData?: { mimeType: string; data: string }
}

export interface GeminiContent {
  role?: 'user' | 'model' | 'assistant' | 'system'
  parts: GeminiContentPart[]
}

@Injectable()
export class GeminiClient {
  constructor(private readonly configService: ConfigService) {}

  async generateContent(opts: {
    model?: string
    systemPrompt?: string
    inlineData?: { mimeType: string; data: string }
    contents?: GeminiContent[]
    generationConfig?: ModelConfig
    signal?: AbortSignal
  }): Promise<string> {
    const config = this.getConfig()
    if (!config.GEMINI_API_KEY) throw new ServiceUnavailableException('Gemini no disponible temporalmente')
    const controller = opts.signal ? undefined : new AbortController()
    const timeout = controller ? setTimeout(() => controller.abort(), config.GEMINI_TIMEOUT_MS) : undefined
    try {
      const model = opts.model || config.GEMINI_API_MODEL
      const contents = opts.contents?.length ? opts.contents.map((c) => ({ role: c.role === 'assistant' ? 'model' : c.role === 'user' ? 'user' : undefined, parts: c.parts }))
        : opts.inlineData ? [{ parts: [...(opts.systemPrompt ? [{ text: opts.systemPrompt }] : []), { inlineData: opts.inlineData }] }]
        : opts.systemPrompt ? [{ parts: [{ text: opts.systemPrompt }] }] : []
      const body: Record<string, unknown> = { contents, generationConfig: opts.generationConfig }
      if (opts.systemPrompt && opts.contents?.length) body.systemInstruction = { parts: [{ text: opts.systemPrompt }] }
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.GEMINI_API_KEY }, signal: opts.signal || controller?.signal, body: JSON.stringify(body) })
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

  async chat(opts: { systemInstruction?: string; history: ChatMessage[]; tools?: FunctionDeclaration[]; generationConfig?: ModelConfig; model?: string; signal?: AbortSignal }): Promise<ChatGenerateResponse> {
    const config = this.getConfig()
    if (!config.GEMINI_API_KEY) throw new ServiceUnavailableException('Gemini no disponible temporalmente')
    const controller = opts.signal ? undefined : new AbortController()
    const timeout = controller ? setTimeout(() => controller.abort(), config.GEMINI_TIMEOUT_MS) : undefined
    try {
      const contents = opts.history.map((m) => ({
        role: m.role,
        parts: m.parts.map((p) => p.functionCall
          ? { functionCall: p.functionCall }
          : p.functionResponse ? { functionResponse: p.functionResponse } : { text: p.text }),
      }))
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(opts.model || config.GEMINI_API_MODEL)}:generateContent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.GEMINI_API_KEY },
        signal: opts.signal || controller?.signal,
        body: JSON.stringify({ systemInstruction: opts.systemInstruction ? { parts: [{ text: opts.systemInstruction }] } : undefined, contents, tools: opts.tools?.length ? [{ functionDeclarations: opts.tools }] : undefined, generationConfig: opts.generationConfig }),
      })
      if (!response.ok) { const body = await response.text().catch(() => 'Unknown error'); console.error(`[GeminiClient] Gemini request failed (${response.status}): ${body.slice(0, 1000)}`); throw new ServiceUnavailableException('Gemini no disponible temporalmente') }
      const candidate = ((await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string; functionCall?: FunctionCall }> }; finishReason?: string }> }).candidates?.[0]
      const parts = candidate?.content?.parts || []
      return { text: parts.find((p) => p.text)?.text, functionCalls: parts.filter((p) => p.functionCall).map((p) => p.functionCall as FunctionCall), finishReason: candidate?.finishReason }
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error
      if (controller && (error as { name?: string })?.name === 'AbortError') throw new ServiceUnavailableException('Tiempo de espera agotado al contactar Gemini')
      console.error('[GeminiClient] Gemini request failed unexpectedly')
      throw new ServiceUnavailableException('Gemini no disponible temporalmente')
    } finally { if (timeout) clearTimeout(timeout) }
  }

  private getConfig(): AiConfig {
    return { GEMINI_API_KEY: this.configService.get<string>('GEMINI_API_KEY'), GEMINI_API_MODEL: this.configService.get<string>('GEMINI_API_MODEL') || 'gemini-2.5-flash', GEMINI_TEMPERATURE: Number(this.configService.get('GEMINI_TEMPERATURE') ?? 0.1), GEMINI_MAX_OUTPUT_TOKENS: Number(this.configService.get('GEMINI_MAX_OUTPUT_TOKENS') ?? 2048), GEMINI_TIMEOUT_MS: Number(this.configService.get('GEMINI_TIMEOUT_MS') ?? 20000) }
  }
}
