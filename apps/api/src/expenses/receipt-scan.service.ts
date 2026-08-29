import { BadRequestException, Injectable } from '@nestjs/common'
import { GeminiClient } from '../ai/client/gemini.client'
import { PromptRegistry } from '../ai/prompts/prompt.registry'
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './receipt-scan.types'
import type { ScanReceiptResponse } from './receipt-scan.types'
import { parseGeminiResponse } from './receipt-scan.parser'
import { validateAndNormalize } from './receipt-scan.utils'

@Injectable()
export class ReceiptScanService {
  constructor(
    private readonly geminiClient: GeminiClient,
    private readonly promptRegistry: PromptRegistry,
  ) {}

  async scan(imageBuffer: Buffer, mimeType: string): Promise<ScanReceiptResponse> {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new BadRequestException(`Formato de imagen no soportado. Permitidos: ${ALLOWED_MIME_TYPES.join(', ')}`)
    }

    if (imageBuffer.length > MAX_FILE_SIZE) {
      throw new BadRequestException(`La imagen excede el tamaño máximo de ${MAX_FILE_SIZE / 1024 / 1024}MB.`)
    }

    const base64 = imageBuffer.toString('base64')
    const { systemPrompt, generationConfig } = this.promptRegistry.get('receipt-scan:v1')
    const text = await this.geminiClient.generateContent({
      systemPrompt,
      inlineData: { mimeType, data: base64 },
      generationConfig,
    })

    const parsed = parseGeminiResponse(text)
    if (!parsed) {
      const snippet = text.length > 500 ? text.slice(0, 500) + '…' : text
      throw new BadRequestException(
        `Gemini devolvió una respuesta que no pudo interpretarse como JSON. Respuesta: ${snippet}`,
      )
    }

    return validateAndNormalize(parsed)
  }
}
